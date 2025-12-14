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
        if user.rol.nombre_rol in ['admin', 'coordinador']:
            return self.queryset.all()
        return self.queryset.filter(usuario=user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

    # --- ENDPOINT DE ESTADÍSTICAS AVANZADAS ---
    @action(detail=False, methods=['get'])
    def estadisticas(self, request):
        """
        Devuelve métricas filtradas por fecha, carrera y área.
        """
        # 1. Filtros de Fecha
        now = timezone.now()
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date and end_date:
            fecha_inicio = datetime.strptime(start_date, '%Y-%m-%d').date()
            fecha_fin = datetime.strptime(end_date, '%Y-%m-%d').date()
        else:
            fecha_inicio = now.date().replace(day=1)
            fecha_fin = now.date()

        # Base de consultas
        reservas_filtradas = self.get_queryset().filter(
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

        # 4. Top Carreras (Si ya filtramos por carrera, esto mostrará solo esa)
        top_carreras = reservas_filtradas.values('usuario__carrera__nombre_carrera')\
            .annotate(total=Count('id'))\
            .order_by('-total')[:5]
        
        data_carreras = [
            {'name': item['usuario__carrera__nombre_carrera'] or 'Sin Carrera', 'value': item['total']} 
            for item in top_carreras
        ]

        # 5. Top Elementos (NUEVO: Cuenta insumos solicitados en estas reservas)
        # Usamos ReservaElemento para sumar cantidades
        top_elementos = ReservaElemento.objects.filter(reserva__in=reservas_filtradas)\
            .values('elemento__nombre')\
            .annotate(total_solicitado=Sum('cantidad_solicitada'))\
            .order_by('-total_solicitado')[:5]

        data_elementos = [
            {'name': item['elemento__nombre'], 'cantidad': item['total_solicitado']}
            for item in top_elementos
        ]

        # 6. Top Espacios
        top_espacios = reservas_filtradas.values('espacio__nombre')\
            .annotate(total=Count('id'))\
            .order_by('-total')[:5]
        
        data_espacios = [
            {'name': item['espacio__nombre'], 'reservas': item['total']}
            for item in top_espacios
        ]

        # 7. Datos Diario (Evolución)
        por_dia = reservas_filtradas.values('fecha_reserva')\
            .annotate(total=Count('id'))\
            .order_by('fecha_reserva')
        
        data_diario = [
            {'fecha': item['fecha_reserva'].strftime('%Y-%m-%d'), 'total': item['total']}
            for item in por_dia
        ]

        # 8. Agenda Hoy (Solo si no hay filtros históricos, o simplemente informativa)
        hoy = timezone.now().date()
        reservas_hoy = self.get_queryset().filter(fecha_reserva=hoy)
        agenda_hoy = {
            'total_hoy': reservas_hoy.count(),
            'eventos': reservas_hoy.filter(estado='aprobada').values('hora_inicio', 'espacio__nombre', 'motivo').order_by('hora_inicio')[:3],
            'pendientes_accion': reservas_hoy.filter(estado='pendiente').count()
        }

        return Response({
            'kpis': {'total': total, 'aprobadas': aprobadas, 'rechazadas': rechazadas, 'tasa_aprobacion': tasa_aprobacion},
            'graficos': {
                'carreras': data_carreras, 
                'espacios': data_espacios, 
                'elementos': data_elementos, # <--- Enviamos elementos al frontend
                'diario': data_diario
            },
            'agenda_hoy': agenda_hoy
        })

    # --- REPORTE PDF FILTRADO ---
    @action(detail=False, methods=['get'])
    def exportar_reporte(self, request):
        """Generar PDF respetando los filtros actuales"""
        
        # ... (Lógica de filtros idéntica a 'estadisticas') ...
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        carrera_id = request.query_params.get('carrera')
        area_nombre = request.query_params.get('area')
        
        # Filtramos
        reservas = self.get_queryset()
        if start_date and end_date:
            reservas = reservas.filter(fecha_reserva__range=[start_date, end_date])
        if carrera_id:
            reservas = reservas.filter(usuario__carrera__id=carrera_id)
        if area_nombre:
            reservas = reservas.filter(usuario__carrera__area=area_nombre)
            
        reservas = reservas.order_by('-fecha_reserva')

        # --- GENERACIÓN PDF ---
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=landscape(letter), rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)
        elements = []
        styles = getSampleStyleSheet()

        # Encabezado
        header_style = ParagraphStyle('Header', parent=styles['Heading1'], textColor=colors.red, alignment=1)
        elements.append(Paragraph("INACAP - REPORTE DE GESTIÓN DE ESPACIOS", header_style))
        
        # Subtítulo con filtros aplicados
        filtro_texto = f"Periodo: {start_date or 'Inicio'} al {end_date or 'Hoy'}"
        if area_nombre: filtro_texto += f" | Área: {area_nombre}"
        elements.append(Paragraph(filtro_texto, styles['Normal']))
        elements.append(Spacer(1, 12))

        # Tabla
        data = [['Fecha', 'Solicitante', 'Carrera', 'Espacio', 'Horario', 'Estado']]
        for r in reservas:
            carrera = r.usuario.carrera.nombre_carrera if r.usuario.carrera else "N/A"
            data.append([
                r.fecha_reserva,
                f"{r.usuario.nombre} {r.usuario.apellido}",
                carrera[:25],
                r.espacio.nombre,
                f"{r.hora_inicio} - {r.hora_fin}",
                r.get_estado_display()
            ])

        t = Table(data, colWidths=[70, 120, 140, 100, 80, 70])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.darkred),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ]))
        elements.append(t)
        doc.build(elements)
        
        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Reporte_Gestion_{timezone.now().date()}.pdf"'
        return response

    # (Mantener acciones aprobar/rechazar/pendientes igual que antes)
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