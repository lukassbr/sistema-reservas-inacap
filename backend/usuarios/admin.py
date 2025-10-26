from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Rol

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre_rol', 'descripcion')
    search_fields = ('nombre_rol',)
    list_filter = ('nombre_rol',)

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('email', 'nombre', 'apellido', 'rol', 'estado', 'is_staff', 'fecha_creacion')
    list_filter = ('rol', 'estado', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('email', 'nombre', 'apellido')
    ordering = ('-fecha_creacion',)
    
    fieldsets = (
        ('Información Personal', {
            'fields': ('email', 'nombre', 'apellido', 'telefono')
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
            'fields': ('email', 'nombre', 'apellido', 'rol', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ('fecha_creacion', 'ultimo_acceso', 'last_login')