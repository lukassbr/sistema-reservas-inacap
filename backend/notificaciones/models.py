from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from reservas.models import Reserva

class Notificacion(models.Model):
    """Notificaciones del sistema"""
    
    TIPO_CHOICES = [
        ('email', 'Email'),
        ('sistema', 'Sistema'),
        ('push', 'Push'),
    ]
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('enviada', 'Enviada'),
        ('fallida', 'Fallida'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        verbose_name='Usuario'
    )
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notificaciones',
        verbose_name='Reserva'
    )
    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CHOICES,
        default='email',
        verbose_name='Tipo'
    )
    asunto = models.CharField(
        max_length=200,
        verbose_name='Asunto'
    )
    mensaje = models.TextField(
        verbose_name='Mensaje'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente',
        verbose_name='Estado'
    )
    fecha_envio = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Envío'
    )
    fecha_lectura = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Lectura'
    )
    fecha_creacion = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha de Creación'
    )
    
    class Meta:
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"{self.asunto} - {self.usuario.email}"