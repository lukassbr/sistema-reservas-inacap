from django.db import models
from django.utils import timezone
from usuarios.models import Usuario
from espacios.models import Espacio
from elementos.models import Elemento

class Reserva(models.Model):
    """Reservas de espacios"""
    
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('rechazada', 'Rechazada'),
        ('cancelada', 'Cancelada'),
        ('completada', 'Completada'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.PROTECT,
        related_name='reservas_creadas',
        verbose_name='Solicitante'
    )
    espacio = models.ForeignKey(
        Espacio,
        on_delete=models.PROTECT,
        related_name='reservas',
        verbose_name='Espacio'
    )
    fecha_reserva = models.DateField(
        verbose_name='Fecha de Reserva'
    )
    hora_inicio = models.TimeField(
        verbose_name='Hora de Inicio'
    )
    hora_fin = models.TimeField(
        verbose_name='Hora de Fin'
    )
    motivo = models.TextField(
        verbose_name='Motivo de la Reserva'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='pendiente',
        verbose_name='Estado'
    )
    observaciones = models.TextField(
        blank=True,
        null=True,
        verbose_name='Observaciones'
    )
    aprobado_por = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas_aprobadas',
        verbose_name='Aprobado por'
    )
    fecha_creacion = models.DateTimeField(
        default=timezone.now,
        verbose_name='Fecha de Creación'
    )
    fecha_aprobacion = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de Aprobación'
    )
    
    class Meta:
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha_creacion']
        indexes = [
            models.Index(fields=['fecha_reserva', 'hora_inicio']),
            models.Index(fields=['estado']),
        ]
    
    def __str__(self):
        return f"{self.espacio.nombre} - {self.fecha_reserva} ({self.get_estado_display()})"


class ReservaElemento(models.Model):
    """Elementos asignados a cada reserva"""
    
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        related_name='elementos',
        verbose_name='Reserva'
    )
    elemento = models.ForeignKey(
        Elemento,
        on_delete=models.PROTECT,
        related_name='reservas_elemento',
        verbose_name='Elemento'
    )
    cantidad_solicitada = models.IntegerField(
        verbose_name='Cantidad Solicitada'
    )
    cantidad_asignada = models.IntegerField(
        null=True,
        blank=True,
        verbose_name='Cantidad Asignada'
    )
    
    class Meta:
        verbose_name = 'Elemento de Reserva'
        verbose_name_plural = 'Elementos de Reserva'
        unique_together = ['reserva', 'elemento']
    
    def __str__(self):
        return f"{self.elemento.nombre} x{self.cantidad_solicitada} - {self.reserva}"