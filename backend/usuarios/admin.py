from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Rol, Carrera

@admin.register(Carrera)
class CarreraAdmin(admin.ModelAdmin):
    list_display = ('nombre_carrera', 'codigo', 'area')
    search_fields = ('nombre_carrera', 'codigo')
    ordering = ('nombre_carrera',)

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre_rol', 'descripcion')
    search_fields = ('nombre_rol',)
    list_filter = ('nombre_rol',)

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('email', 'nombre', 'apellido', 'rol', 'carrera', 'estado', 'is_staff', 'fecha_creacion')
    list_filter = ('rol', 'carrera', 'estado', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'nombre', 'apellido')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('email', 'nombre', 'apellido', 'telefono', 'carrera')
        }),
        ('Permisos y Rol', {
            'fields': ('rol', 'estado', 'is_active', 'is_staff', 'is_superuser')
        }),
        ('Fechas Importantes', {
            'fields': ('fecha_creacion', 'ultimo_acceso', 'last_login')
        }),
    )
    
    add_fieldsets = (
        ('Crear Usuario', {
            'classes': ('wide',),
            'fields': ('email', 'nombre', 'apellido', 'rol', 'carrera', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'ultimo_acceso', 'last_login')