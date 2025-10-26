from rest_framework import serializers
from .models import Espacio

class EspacioSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Espacio
        fields = '__all__'
        read_only_fields = ('id',)

class EspacioListSerializer(serializers.ModelSerializer):
    """Versión simplificada para listados"""
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    
    class Meta:
        model = Espacio
        fields = ('id', 'nombre', 'tipo', 'tipo_display', 'capacidad', 'ubicacion', 'estado', 'disponible')