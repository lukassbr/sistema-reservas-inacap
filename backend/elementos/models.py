from django.db import models

class Elemento(models.Model):
    """Elementos disponibles para asignar a reservas"""
    
    CATEGORIA_CHOICES = [
        ('mobiliario', 'Mobiliario'),
        ('tecnologia', 'Tecnología'),
        ('decoracion', 'Decoración'),
        ('audio', 'Audio y Sonido'),
        ('iluminacion', 'Iluminación'),
        ('otro', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('disponible', 'Disponible'),
        ('mantenimiento', 'En Mantenimiento'),
        ('dado_baja', 'Dado de Baja'),
    ]
    
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre del Elemento'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    categoria = models.CharField(
        max_length=50,
        choices=CATEGORIA_CHOICES,
        verbose_name='Categoría'
    )
    stock_total = models.IntegerField(
        verbose_name='Stock Total'
    )
    stock_disponible = models.IntegerField(
        verbose_name='Stock Disponible'
    )
    unidad_medida = models.CharField(
        max_length=20,
        default='unidad',
        verbose_name='Unidad de Medida'
    )
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='disponible',
        verbose_name='Estado'
    )
    
    class Meta:
        verbose_name = 'Elemento'
        verbose_name_plural = 'Elementos'
        ordering = ['categoria', 'nombre']
        constraints = [
            models.CheckConstraint(
                check=models.Q(stock_disponible__lte=models.F('stock_total')),
                name='stock_disponible_no_mayor_que_total'
            ),
            models.CheckConstraint(
                check=models.Q(stock_disponible__gte=0),
                name='stock_disponible_no_negativo'
            ),
        ]
    
    def __str__(self):
        return f"{self.nombre} ({self.stock_disponible}/{self.stock_total})"