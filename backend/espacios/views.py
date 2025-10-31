from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Espacio
from .serializers import EspacioSerializer, EspacioListSerializer

class EspacioViewSet(viewsets.ModelViewSet):
    queryset = Espacio.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EspacioListSerializer
        return EspacioSerializer
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Obtener solo espacios disponibles"""
        espacios = self.queryset.filter(disponible=True, estado='disponible')
        serializer = self.get_serializer(espacios, many=True)
        return Response(serializer.data)
    
def index(request):
    return JsonResponse({"message": "API de espacios funcionando correctamente"})