from django.urls import path
from . import views

urlpatterns = [
    # Ejemplo temporal (puedes borrarlo luego)
    path('', views.index, name='usuarios_index'),
]
