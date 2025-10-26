from django.contrib import admin
from .models import Elemento

@admin.register(Elemento)
class ElementoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'categoria', 'stock_disponible', 'stock_total', 'unidad_medida', 'estado')
    list_filter = ('categoria', 'estado')
    search_fields = ('nombre', 'descripcion')
    list_editable = ('stock_disponible', 'estado')
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'categoria', 'descripcion')
        }),
        ('Inventario', {
            'fields': ('stock_total', 'stock_disponible', 'unidad_medida')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        # Si es nuevo objeto, stock_disponible = stock_total
        if not change:
            obj.stock_disponible = obj.stock_total
        super().save_model(request, obj, form, change)