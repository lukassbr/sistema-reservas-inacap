from rest_framework import serializers
from .models import Elemento

class ElementoSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(source='get_categoria_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Elemento
        fields = '__all__'
        read_only_fields = ('id',)
    
    def validate(self, attrs):
        if 'stock_disponible' in attrs and 'stock_total' in attrs:
            if attrs['stock_disponible'] > attrs['stock_total']:
                raise serializers.ValidationError("Stock disponible no puede ser mayor que stock total")
        return attrs