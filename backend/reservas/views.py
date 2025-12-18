from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Count, Sum, Q 
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from datetime import datetime
import io

# --- IMPORTACIONES PARA PDF (ReportLab) ---
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from .models import Reserva, ReservaElemento
from .serializers import ReservaSerializer, ReservaCreateSerializer

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReservaCreateSerializer
        return ReservaSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Admin y Coordinador ven todo
        if user.rol.nombre_rol in ['admin', 'coordinador']:
            return self.queryset.all()
        
        # --- SOLUCIÓN CALENDARIO ---
        # El solicitante ve:
        # 1. Sus propias reservas (Q(usuario=user)) -> Para ver sus estados
        # 2. O (|) las reservas de OTROS que ya estén 'aprobada' -> Para ver ocupación en calendario
        return self.queryset.filter(Q(usuario=user) | Q(estado='aprobada'))
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # --- NUEVA ACCIÓN: MIS RESERVAS (EXCLUSIVO LISTA PERSONAL) ---
    @action(detail=False, methods=['get'])
    def mis_reservas(self, request):
        """Devuelve SOLO las reservas del usuario actual para su lista personal"""
        reservas = self.queryset.filter(usuario=request.user).order_by('-fecha_reserva')
        
        page = self.paginate_queryset(reservas)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)

    # --- ENDPOINT DE ESTADÍSTICAS AVANZADAS (CORREGIDO) ---
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        # 1. Filtros de Fecha
        # CORRECCIÓN: Usamos localdate() para respetar la zona horaria definida en settings (Chile)
        hoy = timezone.localdate()
        
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date and end_date:
            fecha_inicio = datetime.strptime(start_date, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            fecha_inicio = hoy.replace(day=1)
            fecha_fin = hoy

        # Para estadísticas usamos siempre .all() filtrado, no restringido por usuario
        reservas_filtradas = self.queryset.all().filter(
            fecha_reserva__range=[fecha_inicio, fecha_fin]
        )

        # 2. Filtros Adicionales (Carrera / Área)
        carrera_id = request.query_params.get('carrera')
        area_nombre = request.query_params.get('area')

        if carrera_id:
            reservas_filtradas = reservas_filtradas.filter(usuario__carrera__id=carrera_id)
        
        if area_nombre:
            reservas_filtradas = reservas_filtradas.filter(usuario__carrera__area=area_nombre)

        # 3. Cálculo de KPIs
        total = reservas_filtradas.count()
        aprobadas = reservas_filtradas.filter(estado='aprobada').count()
        rechazadas = reservas_filtradas.filter(estado='rechazada').count()
        tasa_aprobacion = round((aprobadas / total * 100), 1) if total > 0 else 0

        # 4. Gráficos
        top_carreras = reservas_filtradas.values('usuario__carrera__nombre_carrera').annotate(total=Count('id')).order_by('-total')[:5]
        data_carreras = [{'name': item['usuario__carrera__nombre_carrera'] or 'Sin Carrera', 'value': item['total']} for item in top_carreras]

        top_elementos = ReservaElemento.objects.filter(reserva__in=reservas_filtradas).values('elemento__nombre').annotate(total_solicitado=Sum('cantidad_solicitada')).order_by('-total_solicitado')[:5]
        data_elementos = [{'name': item['elemento__nombre'], 'cantidad': item['total_solicitado']} for item in top_elementos]

        top_espacios = reservas_filtradas.values('espacio__nombre').annotate(total=Count('id')).order_by('-total')[:5]
        data_espacios = [{'name': item['espacio__nombre'], 'reservas': item['total']} for item in top_espacios]

        por_dia = reservas_filtradas.values('fecha_reserva').annotate(total=Count('id')).order_by('fecha_reserva')
        data_diario = [{'fecha': item['fecha_reserva'].strftime('%Y-%m-%d'), 'total': item['total']} for item in por_dia]

        # 8. Agenda Hoy & Pendientes
        reservas_hoy = self.queryset.all().filter(fecha_reserva=hoy)
        
        # CORRECCIÓN: Contamos TODAS las pendientes históricas, no solo las de "hoy"
        total_pendientes = self.queryset.all().filter(estado='pendiente').count()

        agenda_hoy = {
            'total_hoy': reservas_hoy.count(),
            'eventos': reservas_hoy.filter(estado='aprobada').values('hora_inicio', 'espacio__nombre', 'motivo').order_by('hora_inicio')[:3],
            'pendientes_accion': total_pendientes  # Ahora muestra el total real pendiente
        }

        return Response({
            'kpis': {'total': total, 'aprobadas': aprobadas, 'rechazadas': rechazadas, 'tasa_aprobacion': tasa_aprobacion},
            'graficos': {'carreras': data_carreras, 'espacios': data_espacios, 'elementos': data_elementos, 'diario': data_diario},
            'agenda_hoy': agenda_hoy
        })

    # --- REPORTE PDF MEJORADO ---
    @action(detail=False, methods=['get'])
    def exportar_reporte(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        carrera_id = request.query_params.get('carrera')
        area_nombre = request.query_params.get('area')
        
        reservas = self.queryset.all()
        if start_date and end_date:
            reservas = reservas.filter(fecha_reserva__range=[start_date, end_date])
        if carrera_id:
            reservas = reservas.filter(usuario__carrera__id=carrera_id)
        if area_nombre:
            reservas = reservas.filter(usuario__carrera__area=area_nombre)
            
        reservas = reservas.order_by('-fecha_reserva')

        total = reservas.count()
        aprobadas = reservas.filter(estado='aprobada').count()
        rechazadas = reservas.filter(estado='rechazada').count()
        pendientes = reservas.filter(estado='pendiente').count()
        tasa_exito = (aprobadas / total * 100) if total > 0 else 0

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=30)
        elements = []
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=24, textColor=colors.darkred, spaceAfter=20, alignment=1)
        elements.append(Paragraph("INACAP - Informe de Gestión de Espacios", title_style))
        
        try:
            fmt_start = datetime.strptime(start_date, '%Y-%m-%d').strftime('%d/%m/%Y') if start_date else "Inicio"
            fmt_end = datetime.strptime(end_date, '%Y-%m-%d').strftime('%d/%m/%Y') if end_date else "Hoy"
        except:
            fmt_start, fmt_end = start_date, end_date

        info_text = f"<b>Generado el:</b> {datetime.now().strftime('%d/%m/%Y %H:%M')}<br/><b>Periodo:</b> {fmt_start} al {fmt_end}"
        if area_nombre: info_text += f" | <b>Área:</b> {area_nombre}"
        
        elements.append(Paragraph(info_text, styles['Normal']))
        elements.append(Spacer(1, 20))

        data_summary = [
            ['Total Solicitudes', 'Aprobadas', 'Rechazadas', 'Pendientes', 'Tasa Aprobación'],
            [total, aprobadas, rechazadas, pendientes, f"{tasa_exito:.1f}%"]
        ]
        
        t_summary = Table(data_summary, colWidths=[100, 80, 80, 80, 100])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 30))

        elements.append(Paragraph("Detalle de Transacciones", styles['Heading2']))
        elements.append(Spacer(1, 10))

        data = [['Fecha', 'Solicitante', 'Carrera', 'Espacio', 'Horario', 'Estado']]
        for r in reservas:
            carrera = r.usuario.carrera.nombre_carrera if r.usuario.carrera else "N/A"
            fecha_fmt = r.fecha_reserva.strftime('%d/%m/%Y') if r.fecha_reserva else "-"
            
            data.append([
                fecha_fmt,
                f"{r.usuario.nombre} {r.usuario.apellido}",
                carrera[:20],
                r.espacio.nombre,
                f"{r.hora_inicio} - {r.hora_fin}",
                r.get_estado_display()
            ])

        col_widths = [70, 140, 140, 120, 90, 80]
        t = Table(data, colWidths=col_widths, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        
        elements.append(t)
        doc.build(elements)
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        filename = f"Reporte_Gestion_{datetime.now().strftime('%Y%m%d')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        reserva = self.get_object()
        reserva.estado = 'aprobada'
        reserva.save()
        return Response(self.get_serializer(reserva).data)

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        reserva = self.get_object()
        reserva.estado = 'rechazada'
        motivo = request.data.get('motivo_rechazo')
        if motivo:
            reserva.motivo_rechazo = motivo
        reserva.save()
        return Response(self.get_serializer(reserva).data)

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        reservas = self.queryset.filter(estado='pendiente')
        return Response(self.get_serializer(reservas, many=True).data)