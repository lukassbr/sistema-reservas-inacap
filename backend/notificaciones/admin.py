from django.contrib import admin
from .models import Notificacion

@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'asunto', 'tipo', 'estado', 'fecha_creacion', 'fecha_envio')
    list_filter = ('tipo', 'estado', 'fecha_creacion')
    search_fields = ('usuario__email', 'asunto', 'mensaje')
    date_hierarchy = 'fecha_creacion'
    readonly_fields = ('fecha_creacion', 'fecha_envio', 'fecha_lectura')
    
    fieldsets = (
        ('Destinatario', {
            'fields': ('usuario', 'reserva')
        }),
        ('Contenido', {
            'fields': ('tipo', 'asunto', 'mensaje')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_envio', 'fecha_lectura')
        }),
        ('Información', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )