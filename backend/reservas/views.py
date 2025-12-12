from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.http import JsonResponse
from .models import Reserva
from .serializers import ReservaSerializer, ReservaCreateSerializer
import csv
from django.http import HttpResponse, HttpResponseForbidden

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReservaCreateSerializer
        return ReservaSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Si es admin o coordinador, ver todas
        if user.rol.nombre_rol in ['admin', 'coordinador']:
            return self.queryset.all()
        # Si es solicitante, solo ver las propias
        return self.queryset.filter(usuario=user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
    @action(detail=False, methods=['get'])
    def exportar_csv(self, request):
        """Generar y descargar CSV (SOLO ADMIN)"""
        
        # --- NUEVA VALIDACIÓN DE SEGURIDAD ---
        # Si el usuario NO es 'admin', denegamos el acceso inmediatamente.
        if not request.user.rol or request.user.rol.nombre_rol != 'admin':
             return HttpResponseForbidden("Acceso denegado: Solo el Administrador puede exportar registros.")
        # -------------------------------------

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="historial_reservas.csv"'

        writer = csv.writer(response)
        
        writer.writerow([
            'ID', 'Solicitante', 'Email', 'Espacio', 'Fecha Reserva', 
            'Hora Inicio', 'Hora Fin', 'Estado', 'Motivo', 
            'Observaciones', 'Fecha Creación'
        ])

        reservas = self.get_queryset().order_by('-fecha_reserva')

        for reserva in reservas:
            writer.writerow([
                reserva.id,
                f"{reserva.usuario.nombre} {reserva.usuario.apellido}",
                reserva.usuario.email,
                reserva.espacio.nombre,
                reserva.fecha_reserva,
                reserva.hora_inicio,
                reserva.hora_fin,
                reserva.get_estado_display(),
                reserva.motivo,
                reserva.observaciones or "",
                reserva.fecha_creacion.strftime("%Y-%m-%d %H:%M")
            ])
        
        return response

    @action(detail=True, methods=['post'])
    def aprobar(self, request, pk=None):
        """Aprobar una reserva"""
        reserva = self.get_object()
        
        if request.user.rol.nombre_rol not in ['admin', 'coordinador']:
            return Response(
                {'error': 'No tiene permisos para aprobar reservas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if reserva.estado != 'pendiente':
            return Response(
                {'error': 'Solo se pueden aprobar reservas pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.estado = 'aprobada'
        reserva.aprobado_por = request.user
        reserva.fecha_aprobacion = timezone.now()
        reserva.save()
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        """Rechazar una reserva"""
        reserva = self.get_object()
        
        if request.user.rol.nombre_rol not in ['admin', 'coordinador']:
            return Response(
                {'error': 'No tiene permisos para rechazar reservas'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if reserva.estado != 'pendiente':
            return Response(
                {'error': 'Solo se pueden rechazar reservas pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        observaciones = request.data.get('observaciones', '')
        reserva.estado = 'rechazada'
        reserva.aprobado_por = request.user
        reserva.fecha_aprobacion = timezone.now()
        reserva.observaciones = observaciones
        reserva.save()
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        """Obtener reservas pendientes de aprobación"""
        if request.user.rol.nombre_rol not in ['admin', 'coordinador']:
            return Response(
                {'error': 'No tiene permisos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reservas = self.queryset.filter(estado='pendiente')
        serializer = self.get_serializer(reservas, many=True)
        return Response(serializer.data)
    
def index(request):
    return JsonResponse({"message": "API de reservas funcionando correctamente"})