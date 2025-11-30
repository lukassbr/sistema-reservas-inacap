import os
import sys
import django

# Agregar el directorio padre al path de Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from usuarios.models import Usuario, Rol
from espacios.models import Espacio
from elementos.models import Elemento
from reservas.models import Reserva, ReservaElemento
from datetime import date, time, timedelta

def crear_roles():
    """Crea los roles base del sistema si no existen"""
    print("Creando/Verificando roles...")
    roles_data = [
        ('admin', 'Administrador'),
        ('coordinador', 'Coordinador'),
        ('solicitante', 'Solicitante'),
        ('mantenimiento', 'Personal de Mantenimiento'),
    ]
    
    for nombre, desc in roles_data:
        rol, created = Rol.objects.get_or_create(
            nombre_rol=nombre,
            defaults={'descripcion': desc}
        )
        estado = "Creado" if created else "Ya existía"
        print(f"- Rol {nombre}: {estado}")

def crear_usuarios_prueba():
    """Crear usuarios de prueba para cada rol"""
    print("\nCreando usuarios de prueba...")
    
    # Obtener roles (ahora seguro existen)
    rol_admin = Rol.objects.get(nombre_rol='admin')
    rol_coord = Rol.objects.get(nombre_rol='coordinador')
    rol_solic = Rol.objects.get(nombre_rol='solicitante')
    rol_mant = Rol.objects.get(nombre_rol='mantenimiento')
    
    # Crear usuarios si no existen
    usuarios = [
        {
            'email': 'coordinador@inacap.cl',
            'nombre': 'María',
            'apellido': 'González',
            'rol': rol_coord,
            'telefono': '+56912345678'
        },
        {
            'email': 'docente1@inacap.cl',
            'nombre': 'Pedro',
            'apellido': 'Ramírez',
            'rol': rol_solic,
            'telefono': '+56923456789'
        },
        {
            'email': 'docente2@inacap.cl',
            'nombre': 'Ana',
            'apellido': 'Silva',
            'rol': rol_solic,
            'telefono': '+56934567890'
        },
        {
            'email': 'mantenimiento@inacap.cl',
            'nombre': 'Carlos',
            'apellido': 'Mendoza',
            'rol': rol_mant,
            'telefono': '+56945678901'
        },
        # Agregamos un admin explícito también
        {
            'email': 'admin@inacap.cl',
            'nombre': 'Super',
            'apellido': 'Admin',
            'rol': rol_admin,
            'telefono': '+56900000000'
        }
    ]
    
    for user_data in usuarios:
        if not Usuario.objects.filter(email=user_data['email']).exists():
            user = Usuario.objects.create_user(
                email=user_data['email'],
                password='Inacap2025!',  # Todos tendrán esta contraseña
                nombre=user_data['nombre'],
                apellido=user_data['apellido'],
                telefono=user_data['telefono'],
                rol=user_data['rol']
            )
            print(f"✓ Usuario creado: {user.email}")
        else:
            print(f"- Usuario ya existe: {user_data['email']}")

def crear_espacios_prueba():
    """Crear espacios de prueba"""
    print("\nCreando espacios de prueba...")
    
    espacios = [
        {
            'nombre': 'Hall Principal',
            'tipo': 'hall',
            'capacidad': 200,
            'ubicacion': 'Edificio A - Primer Piso',
            'descripcion': 'Espacio amplio para eventos institucionales',
            'caracteristicas': {
                'proyector': True,
                'sonido': True,
                'sillas_incluidas': 200,
                'aire_acondicionado': True
            }
        },
        {
            'nombre': 'Patio Cubierto',
            'tipo': 'patio',
            'capacidad': 150,
            'ubicacion': 'Edificio B - Segundo Piso',
            'descripcion': 'Patio techado para actividades al aire libre',
            'caracteristicas': {
                'techado': True,
                'mesas': 15,
                'enchufes': True
            }
        },
        {
            'nombre': 'Aula Magna',
            'tipo': 'auditorio',
            'capacidad': 100,
            'ubicacion': 'Edificio C - Primer Piso',
            'descripcion': 'Auditorio con equipamiento audiovisual completo',
            'caracteristicas': {
                'proyector': True,
                'sonido_profesional': True,
                'micrófonos': 4,
                'grabación': True
            }
        },
        {
            'nombre': 'Sala de Conferencias',
            'tipo': 'salon',
            'capacidad': 30,
            'ubicacion': 'Edificio A - Tercer Piso',
            'descripcion': 'Sala para reuniones y conferencias pequeñas',
            'caracteristicas': {
                'proyector': True,
                'pizarra': True,
                'videoconferencia': True
            }
        },
        {
            'nombre': 'Laboratorio de Computación 1',
            'tipo': 'laboratorio',
            'capacidad': 25,
            'ubicacion': 'Edificio D - Segundo Piso',
            'descripcion': 'Laboratorio equipado con computadores',
            'caracteristicas': {
                'computadores': 25,
                'proyector': True,
                'software_especializado': True
            }
        },
        {
            'nombre': 'Cancha Deportiva',
            'tipo': 'cancha',
            'capacidad': 50,
            'ubicacion': 'Área Deportiva',
            'descripcion': 'Cancha multiuso para actividades deportivas',
            'caracteristicas': {
                'techada': False,
                'iluminación': True,
                'marcador': True
            }
        }
    ]
    
    for espacio_data in espacios:
        if not Espacio.objects.filter(nombre=espacio_data['nombre']).exists():
            Espacio.objects.create(**espacio_data)
            print(f"✓ Espacio creado: {espacio_data['nombre']}")
        else:
            print(f"- Espacio ya existe: {espacio_data['nombre']}")

def crear_elementos_prueba():
    """Crear elementos de prueba"""
    print("\nCreando elementos de prueba...")
    
    elementos = [
        {'nombre': 'Sillas', 'categoria': 'mobiliario', 'stock_total': 200, 'unidad_medida': 'unidad'},
        {'nombre': 'Mesas', 'categoria': 'mobiliario', 'stock_total': 50, 'unidad_medida': 'unidad'},
        {'nombre': 'Proyector Portátil', 'categoria': 'tecnologia', 'stock_total': 10, 'unidad_medida': 'unidad'},
        {'nombre': 'Sistema de Sonido', 'categoria': 'audio', 'stock_total': 5, 'unidad_medida': 'unidad'},
        {'nombre': 'Micrófonos Inalámbricos', 'categoria': 'audio', 'stock_total': 15, 'unidad_medida': 'unidad'},
        {'nombre': 'Pantalla Proyección', 'categoria': 'tecnologia', 'stock_total': 8, 'unidad_medida': 'unidad'},
        {'nombre': 'Manteles', 'categoria': 'decoracion', 'stock_total': 30, 'unidad_medida': 'unidad'},
        {'nombre': 'Extensiones Eléctricas', 'categoria': 'tecnologia', 'stock_total': 20, 'unidad_medida': 'unidad'},
        {'nombre': 'Atril', 'categoria': 'mobiliario', 'stock_total': 12, 'unidad_medida': 'unidad'},
        {'nombre': 'Pizarra Móvil', 'categoria': 'mobiliario', 'stock_total': 6, 'unidad_medida': 'unidad'},
    ]
    
    for elem_data in elementos:
        if not Elemento.objects.filter(nombre=elem_data['nombre']).exists():
            elem_data['stock_disponible'] = elem_data['stock_total']
            elem_data['descripcion'] = f"Elemento disponible para eventos y reservas"
            Elemento.objects.create(**elem_data)
            print(f"✓ Elemento creado: {elem_data['nombre']}")
        else:
            print(f"- Elemento ya existe: {elem_data['nombre']}")

def crear_reservas_prueba():
    """Crear algunas reservas de ejemplo"""
    print("\nCreando reservas de prueba...")
    
    # Obtener objetos necesarios
    try:
        usuario_solicitante = Usuario.objects.get(email='docente1@inacap.cl')
        coordinador = Usuario.objects.get(email='coordinador@inacap.cl')
        hall = Espacio.objects.get(nombre='Hall Principal')
        patio = Espacio.objects.get(nombre='Patio Cubierto')
        aula = Espacio.objects.get(nombre='Aula Magna')
        
        sillas = Elemento.objects.get(nombre='Sillas')
        mesas = Elemento.objects.get(nombre='Mesas')
        proyector = Elemento.objects.get(nombre='Proyector Portátil')
        
        # Crear reservas
        reservas = [
            {
                'usuario': usuario_solicitante,
                'espacio': hall,
                'fecha_reserva': date.today() + timedelta(days=5),
                'hora_inicio': time(10, 0),
                'hora_fin': time(12, 0),
                'motivo': 'Ceremonia de bienvenida estudiantes nuevos',
                'estado': 'aprobada',
                'aprobado_por': coordinador,
                'elementos': [
                    {'elemento': sillas, 'cantidad': 150},
                    {'elemento': proyector, 'cantidad': 1}
                ]
            },
            {
                'usuario': usuario_solicitante,
                'espacio': patio,
                'fecha_reserva': date.today() + timedelta(days=3),
                'hora_inicio': time(14, 0),
                'hora_fin': time(16, 0),
                'motivo': 'Reunión de apoderados',
                'estado': 'pendiente',
                'elementos': [
                    {'elemento': sillas, 'cantidad': 80},
                    {'elemento': mesas, 'cantidad': 10}
                ]
            },
            {
                'usuario': usuario_solicitante,
                'espacio': aula,
                'fecha_reserva': date.today() + timedelta(days=7),
                'hora_inicio': time(9, 0),
                'hora_fin': time(11, 0),
                'motivo': 'Conferencia sobre tecnologías emergentes',
                'estado': 'aprobada',
                'aprobado_por': coordinador,
                'elementos': [
                    {'elemento': proyector, 'cantidad': 1}
                ]
            }
        ]
        
        for reserva_data in reservas:
            elementos = reserva_data.pop('elementos')
            
            # Verificar si ya existe una reserva similar
            existe = Reserva.objects.filter(
                espacio=reserva_data['espacio'],
                fecha_reserva=reserva_data['fecha_reserva'],
                hora_inicio=reserva_data['hora_inicio']
            ).exists()
            
            if not existe:
                reserva = Reserva.objects.create(**reserva_data)
                
                # Crear elementos asociados
                for elem in elementos:
                    ReservaElemento.objects.create(
                        reserva=reserva,
                        elemento=elem['elemento'],
                        cantidad_solicitada=elem['cantidad'],
                        cantidad_asignada=elem['cantidad'] if reserva.estado == 'aprobada' else None
                    )
                
                print(f"✓ Reserva creada: {reserva.espacio.nombre} - {reserva.fecha_reserva}")
            else:
                print(f"- Reserva similar ya existe para {reserva_data['espacio'].nombre}")
    
    except Exception as e:
        print(f"Error al crear reservas: {str(e)}")

def main():
    """Ejecutar todas las funciones de creación de datos"""
    print("=" * 60)
    print("CREANDO DATOS DE PRUEBA PARA EL SISTEMA")
    print("=" * 60)
    
    crear_roles()          # <--- NUEVO: Crea los roles primero
    crear_usuarios_prueba()
    crear_espacios_prueba()
    crear_elementos_prueba()
    crear_reservas_prueba()
    
    print("\n" + "=" * 60)
    print("✓ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
    print("=" * 60)
    print("\nUSUARIOS CREADOS (todos con password: Inacap2025!):")
    print("- coordinador@inacap.cl (Coordinador)")
    print("- docente1@inacap.cl (Solicitante)")
    print("- admin@inacap.cl (Admin)")
    print("- mantenimiento@inacap.cl (Mantenimiento)")
    print("\nPuedes iniciar sesión con cualquiera de estos usuarios.")

if __name__ == '__main__':
    main()