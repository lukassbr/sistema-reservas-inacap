from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import home

# Importar ViewSets
from usuarios.views import CarreraViewSet, UsuarioViewSet, RolViewSet
from espacios.views import EspacioViewSet
from elementos.views import ElementoViewSet
from reservas.views import ReservaViewSet

# Crear y configurar el router
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'roles', RolViewSet)
router.register(r'espacios', EspacioViewSet)
router.register(r'elementos', ElementoViewSet)
router.register(r'reservas', ReservaViewSet)
router.register(r'carreras', CarreraViewSet)

urlpatterns = [
    # Vista de bienvenida en la raíz
    path('', home, name='home'),
    
    # Panel de administración
    path('admin/', admin.site.urls),
    
    # --- AQUÍ ESTÁ LA SOLUCIÓN ---
    # Incluimos las URLs automáticas del router (CRUDs y acciones como 'pendientes')
    path('api/', include(router.urls)),
    
    # Autenticación JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]