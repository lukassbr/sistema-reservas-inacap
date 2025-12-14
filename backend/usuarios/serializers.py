from rest_framework import serializers
from .models import Usuario, Rol, Carrera


class CarreraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carrera
        fields = '__all__'

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source='rol.get_nombre_rol_display', read_only=True)
    # ESTE CAMPO ES CLAVE: Envía "admin", "coordinador" o "solicitante"
    rol_slug = serializers.CharField(source='rol.nombre_rol', read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    carrera_nombre = serializers.CharField(source='carrera.nombre_carrera', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ('id', 'email', 'nombre', 'apellido', 'nombre_completo', 'telefono', 
                  'rol', 'rol_nombre', 'rol_slug','carrera', 'carrera_nombre', 'estado', 'fecha_creacion', 'ultimo_acceso')
        read_only_fields = ('fecha_creacion', 'ultimo_acceso')
    
    def get_nombre_completo(self, obj):
        return obj.get_full_name()

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = Usuario
        fields = ('email', 'nombre', 'apellido', 'telefono', 'rol', 'carrera', 'password')
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user