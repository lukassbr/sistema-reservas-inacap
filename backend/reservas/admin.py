from django.contrib import admin
from .models import Reserva, ReservaElemento

class ReservaElementoInline(admin.TabularInline):
    model = ReservaElemento
    extra = 1
    fields = ('elemento', 'cantidad_solicitada', 'cantidad_asignada')

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('id', 'espacio', 'usuario', 'fecha_reserva', 'hora_inicio', 'hora_fin', 'estado', 'fecha_creacion')
    list_filter = ('estado', 'fecha_reserva', 'espacio')
    search_fields = ('usuario__email', 'usuario__nombre', 'espacio__nombre', 'motivo')
    date_hierarchy = 'fecha_reserva'
    inlines = [ReservaElementoInline]
    
    fieldsets = (
        ('Información de Reserva', {
            'fields': ('usuario', 'espacio', 'fecha_reserva', 'hora_inicio', 'hora_fin')
        }),
        ('Detalles', {
            'fields': ('motivo', 'observaciones')
        }),
        ('Estado y Aprobación', {
            'fields': ('estado', 'aprobado_por', 'fecha_aprobacion')
        }),
        ('Fechas', {
            'fields': ('fecha_creacion',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('fecha_creacion',)
    
    def save_model(self, request, obj, form, change):
        if change and 'estado' in form.changed_data:
            if obj.estado in ['aprobada', 'rechazada']:
                obj.aprobado_por = request.user
                from django.utils import timezone
                obj.fecha_aprobacion = timezone.now()
        super().save_model(request, obj, form, change)

@admin.register(ReservaElemento)
class ReservaElementoAdmin(admin.ModelAdmin):
    list_display = ('reserva', 'elemento', 'cantidad_solicitada', 'cantidad_asignada')
    list_filter = ('elemento',)
    search_fields = ('reserva__id', 'elemento__nombre')