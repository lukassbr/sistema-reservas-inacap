from django.db import models
from django.utils import timezone
from usuarios.models import Usuario

class Auditoria(models.Model):
    """Registro de auditoría del sistema"""
    
    ACCION_CHOICES = [
        ('CREATE', 'Crear'),
        ('UPDATE', 'Actualizar'),
        ('DELETE', 'Eliminar'),
        ('LOGIN', 'Inicio de Sesión'),
        ('LOGOUT', 'Cierre de Sesión'),
        ('APPROVE', 'Aprobar'),
        ('REJECT', 'Rechazar'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acciones_auditoria',
        verbose_name='Usuario'
    )
    accion = models.CharField(
        max_length=50,
        choices=ACCION_CHOICES,
        verbose_name='Acción'
    )
    tabla_afectada = models.CharField(
        max_length=50,
        verbose_name='Tabla Afectada'
    )
    registro_id = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='ID del Registro'
    )
    valores_previos = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Valores Anteriores'
    )
    valores_nuevos = models.JSONField(
        null=True,
        blank=True,
        verbose_name='Valores Nuevos'
    )
    ip_origen = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='IP de Origen'
    )
    timestamp = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha y Hora',
        db_index=True
    )
    
    class Meta:
        verbose_name = 'Registro de Auditoría'
        verbose_name_plural = 'Registros de Auditoría'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['usuario', 'timestamp']),
            models.Index(fields=['tabla_afectada', 'timestamp']),
        ]
    
    def __str__(self):
        usuario_str = self.usuario.email if self.usuario else 'Sistema'
        return f"{usuario_str} - {self.get_accion_display()} en {self.tabla_afectada}"