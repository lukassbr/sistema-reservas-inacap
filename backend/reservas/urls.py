from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservaViewSet

# Creamos el router de DRF para generar las URLs automáticamente
router = DefaultRouter()
router.register(r'', ReservaViewSet, basename='reservas')

urlpatterns = [
    path('', include(router.urls)),
]