from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Reserva
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
        # Si es admin o coordinador, ver todas
        if user.rol.nombre_rol in ['admin', 'coordinador']:
            return self.queryset.all()
        # Si es solicitante, solo ver las propias
        return self.queryset.filter(usuario=user)
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)
    
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