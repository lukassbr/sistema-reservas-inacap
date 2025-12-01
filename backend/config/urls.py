from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import home

from usuarios.views import UsuarioViewSet, RolViewSet
from espacios.views import EspacioViewSet
from elementos.views import ElementoViewSet
from reservas.views import ReservaViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet) # Esto crea la ruta /api/usuarios/me/
router.register(r'roles', RolViewSet)
router.register(r'espacios', EspacioViewSet)
router.register(r'elementos', ElementoViewSet)
router.register(r'reservas', ReservaViewSet)

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)), # <--- IMPORTANTE: Usar router.urls
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]