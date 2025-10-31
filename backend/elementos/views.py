from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import JsonResponse
from .models import Elemento
from .serializers import ElementoSerializer

class ElementoViewSet(viewsets.ModelViewSet):
    queryset = Elemento.objects.all()
    serializer_class = ElementoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def disponibles(self, request):
        """Obtener elementos con stock disponible"""
        elementos = self.queryset.filter(estado='disponible', stock_disponible__gt=0)
        serializer = self.get_serializer(elementos, many=True)
        return Response(serializer.data)
    
def index(request):
    return JsonResponse({"message": "API de elementos funcionando correctamente"})