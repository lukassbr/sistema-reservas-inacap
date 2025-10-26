from django.contrib import admin
from .models import Auditoria

@admin.register(Auditoria)
class AuditoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'accion', 'tabla_afectada', 'registro_id', 'ip_origen', 'timestamp')
    list_filter = ('accion', 'tabla_afectada', 'timestamp')
    search_fields = ('usuario__email', 'tabla_afectada', 'ip_origen')
    date_hierarchy = 'timestamp'
    readonly_fields = ('usuario', 'accion', 'tabla_afectada', 'registro_id', 
                       'valores_previos', 'valores_nuevos', 'ip_origen', 'timestamp')
    
    fieldsets = (
        ('Información de Auditoría', {
            'fields': ('usuario', 'accion', 'tabla_afectada', 'registro_id')
        }),
        ('Cambios Realizados', {
            'fields': ('valores_previos', 'valores_nuevos')
        }),
        ('Detalles Técnicos', {
            'fields': ('ip_origen', 'timestamp')
        }),
    )
    
    def has_add_permission(self, request):
        # No permitir crear registros manualmente
        return False
    
    def has_delete_permission(self, request, obj=None):
        # No permitir eliminar registros de auditoría
        return False