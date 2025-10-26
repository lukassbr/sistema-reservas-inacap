from rest_framework import serializers
from .models import Notificacion

class NotificacionSerializer(serializers.ModelSerializer):
    usuario_email = serializers.EmailField(source='usuario.email', read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    leida = serializers.SerializerMethodField()
    
    class Meta:
        model = Notificacion
        fields = '__all__'
        read_only_fields = ('fecha_creacion', 'fecha_envio', 'fecha_lectura')
    
    def get_leida(self, obj):
        return obj.fecha_lectura is not None