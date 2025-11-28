from django.urls import path
from . import views

urlpatterns = [
    path('api/cadastro/', views.realizar_cadastro, name='cadastro'),
    path('api/login/', views.realizar_login, name='login'),
    path('api/logout', views.realizar_logout, name='logout'),
    path('api/livros/', views.listar_livros, name='listar_livros'),
    path('api/livros/cadastrar', views.cadastrar_livro, name='cadastrar_livro'),
]