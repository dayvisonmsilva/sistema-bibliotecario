from django.urls import path
from . import views

urlpatterns = [
    path('api/cadastro/', views.realizar_cadastro, name='cadastro'),
    path('api/login/', views.realizar_login, name='login'),
]