from rest_framework import serializers
from .models import Reserva, ReservaElemento
from usuarios.serializers import UsuarioSerializer
from espacios.serializers import EspacioSerializer
from elementos.serializers import ElementoSerializer

class ReservaElementoSerializer(serializers.ModelSerializer):
    elemento_detalle = ElementoSerializer(source='elemento', read_only=True)
    
    class Meta:
        model = ReservaElemento
        fields = ('id', 'elemento', 'elemento_detalle', 'cantidad_solicitada', 'cantidad_asignada')

class ReservaSerializer(serializers.ModelSerializer):
    usuario_detalle = UsuarioSerializer(source='usuario', read_only=True)
    espacio_detalle = EspacioSerializer(source='espacio', read_only=True)
    aprobado_por_detalle = UsuarioSerializer(source='aprobado_por', read_only=True)
    elementos = ReservaElementoSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Reserva
        fields = '__all__'
        read_only_fields = ('fecha_creacion', 'fecha_aprobacion', 'aprobado_por')

class ReservaCreateSerializer(serializers.ModelSerializer):
    elementos = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Reserva
        fields = ('espacio', 'fecha_reserva', 'hora_inicio', 'hora_fin', 'motivo', 'elementos')
    
    def validate(self, attrs):
        # Validar que hora_fin > hora_inicio
        if attrs['hora_fin'] <= attrs['hora_inicio']:
            raise serializers.ValidationError("La hora de fin debe ser posterior a la hora de inicio")
        
        # Validar que la fecha no sea pasada
        from datetime import date
        if attrs['fecha_reserva'] < date.today():
            raise serializers.ValidationError("No se pueden crear reservas en fechas pasadas")
        
        return attrs
    
    def create(self, validated_data):
        elementos_data = validated_data.pop('elementos', [])
        reserva = Reserva.objects.create(**validated_data)
        
        # Crear elementos asociados
        for elemento_data in elementos_data:
            ReservaElemento.objects.create(
                reserva=reserva,
                elemento_id=elemento_data['elemento_id'],
                cantidad_solicitada=elemento_data['cantidad']
            )
        
        return reserva