from django.db import models

class Espacio(models.Model):
    """Espacios físicos disponibles para reserva"""
    
    TIPO_CHOICES = [
        ('salon', 'Salón'),
        ('patio', 'Patio'),
        ('hall', 'Hall'),
        ('laboratorio', 'Laboratorio'),
        ('auditorio', 'Auditorio'),
        ('cancha', 'Cancha Deportiva'),
        ('otro', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('mantenimiento', 'En Mantenimiento'),
        ('bloqueado', 'Bloqueado'),
    ]
    
    nombre = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nombre del Espacio'
    )
    tipo = models.CharField(
        max_length=50,
        choices=TIPO_CHOICES,
        verbose_name='Tipo de Espacio'
    )
    capacidad = models.IntegerField(
        verbose_name='Capacidad (personas)'
    )
    ubicacion = models.CharField(
        max_length=200,
        verbose_name='Ubicación'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    caracteristicas = models.JSONField(
        default=dict,
        blank=True,
        verbose_name='Características'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='disponible',
        verbose_name='Estado'
    )
    disponible = models.BooleanField(
        default=True,
        verbose_name='Disponible para Reservas'
    )
    
    class Meta:
        verbose_name = 'Espacio'
        verbose_name_plural = 'Espacios'
        ordering = ['nombre']
    
    def __str__(self):
        return f"{self.nombre} - Capacidad: {self.capacidad}"