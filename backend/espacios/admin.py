from django.contrib import admin
from .models import Espacio

@admin.register(Espacio)
class EspacioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tipo', 'capacidad', 'ubicacion', 'estado', 'disponible')
    list_filter = ('tipo', 'estado', 'disponible')
    search_fields = ('nombre', 'ubicacion')
    list_editable = ('estado', 'disponible')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'tipo', 'capacidad', 'ubicacion')
        }),
        ('Detalles', {
            'fields': ('descripcion', 'caracteristicas')
        }),
        ('Estado', {
            'fields': ('estado', 'disponible')
        }),
    )