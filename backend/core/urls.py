from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioViewSet, AlunoViewSet, BibliotecarioViewSet,
    LivroViewSet, ExemplarViewSet, ReservaViewSet, EmprestimoViewSet
)

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'alunos', AlunoViewSet)
router.register(r'bibliotecarios', BibliotecarioViewSet)
router.register(r'livros', LivroViewSet)
router.register(r'exemplares', ExemplarViewSet)
router.register(r'reservas', ReservaViewSet)
router.register(r'emprestimos', EmprestimoViewSet, basename='emprestimo')

urlpatterns = [
    path('', include(router.urls)),
]
