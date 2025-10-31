from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, RolSerializer

class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer
    permission_classes = [permissions.IsAuthenticated]

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener información del usuario actual"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
def index(request):
    return JsonResponse({"message": "API de Usuarios está funcionando correctamente."})