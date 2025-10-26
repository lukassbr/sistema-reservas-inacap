from rest_framework import serializers
from .models import Usuario, Rol

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    rol_nombre = serializers.CharField(source='rol.get_nombre_rol_display', read_only=True)
    nombre_completo = serializers.SerializerMethodField()
    
    class Meta:
        model = Usuario
        fields = ('id', 'email', 'nombre', 'apellido', 'nombre_completo', 'telefono', 
                  'rol', 'rol_nombre', 'estado', 'fecha_creacion', 'ultimo_acceso')
        read_only_fields = ('fecha_creacion', 'ultimo_acceso')
    
    def get_nombre_completo(self, obj):
        return obj.get_full_name()

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'}, label='Confirmar Password')
    
    class Meta:
        model = Usuario
        fields = ('email', 'nombre', 'apellido', 'telefono', 'rol', 'password', 'password2')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = Usuario.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user