from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone

class Carrera(models.Model):
    """Modelo para las carreras impartidas en la institución de Temuco"""
    
    nombre_carrera = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nombre de la Carrera'
    )
    codigo = models.TextField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Código de la Carrera'
    )
    area = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='Área Académica'
    )
    
    class Meta:
        verbose_name = 'Carrera'
        verbose_name_plural = 'Carreras'
        ordering = ['nombre_carrera']
    
    def __str__(self):
        return self.nombre_carrera
    



class Rol(models.Model):
    """Roles del sistema: Administrador, Coordinador, Solicitante, Mantenimiento"""
    
    ROLES = [
        ('admin', 'Administrador'),
        ('coordinador', 'Coordinador'),
        ('solicitante', 'Solicitante'),
        ('mantenimiento', 'Personal de Mantenimiento'),
    ]
    
    nombre_rol = models.CharField(
        max_length=50,
        choices=ROLES,
        unique=True,
        verbose_name='Nombre del Rol'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    permisos = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Permisos'
    )
    
    class Meta:
        verbose_name = 'Rol'
        verbose_name_plural = 'Roles'
        ordering = ['nombre_rol']
    
    def __str__(self):
        return self.get_nombre_rol_display()


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crea y guarda un usuario normal"""
        if not email:
            raise ValueError('El email es obligatorio')
        
        email = self.normalize_email(email)
        
        # Si no se proporciona rol, asignar rol de solicitante por defecto
        if 'rol' not in extra_fields:
            rol_solicitante, created = Rol.objects.get_or_create(
                nombre_rol='solicitante',
                defaults={
                    'descripcion': 'Usuario que solicita reservas',
                    'permisos': {}
                }
            )
            extra_fields['rol'] = rol_solicitante
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crea y guarda un superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        
        # Asignar rol de administrador al superusuario
        rol_admin, created = Rol.objects.get_or_create(
            nombre_rol='admin',
            defaults={
                'descripcion': 'Control total del sistema',
                'permisos': {}
            }
        )
        extra_fields['rol'] = rol_admin
        
        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo personalizado de Usuario"""
    
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('inactivo', 'Inactivo'),
        ('bloqueado', 'Bloqueado'),
    ]
    
    email = models.EmailField(
        unique=True,
        verbose_name='Correo Electrónico'
    )
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre'
    )
    apellido = models.CharField(
        max_length=100,
        verbose_name='Apellido'
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono'
    )
    rol = models.ForeignKey(
        Rol,
        on_delete=models.PROTECT,
        related_name='usuarios',
        verbose_name='Rol',
        null=True,  # Permitir null temporalmente
        blank=True
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='activo',
        verbose_name='Estado'
    )
    fecha_creacion = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha de Creación'
    )
    ultimo_acceso = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Último Acceso'
    )
    carrera = models.ForeignKey(
        Carrera,
        on_delete=models.SET_NULL, 
        null=True,
        blank=True,
        related_name='usuarios',
        verbose_name='Carrera'
    )


    # Campos requeridos por Django
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    objects = UsuarioManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido']
    
    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.nombre} {self.apellido} ({self.email})"
    
    def get_full_name(self):
        return f"{self.nombre} {self.apellido}"


