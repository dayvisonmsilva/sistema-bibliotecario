from rest_framework import viewsets, permissions, filters
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo
from .serializers import (
    UsuarioSerializer, AlunoSerializer, BibliotecarioSerializer,
    LivroSerializer, ExemplarSerializer, ReservaSerializer, EmprestimoSerializer,
    CustomTokenObtainPairSerializer
)
from .permissions import IsBibliotecario
from rest_framework_simplejwt.views import TokenObtainPairView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    permission_classes = [permissions.IsAuthenticated]

class BibliotecarioViewSet(viewsets.ModelViewSet):
    queryset = Bibliotecario.objects.all()
    serializer_class = BibliotecarioSerializer
    permission_classes = [permissions.IsAuthenticated]

class LivroViewSet(viewsets.ModelViewSet):
    queryset = Livro.objects.all()
    serializer_class = LivroSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['titulo', 'autor']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [IsBibliotecario]
        return [permission() for permission in permission_classes]

class ExemplarViewSet(viewsets.ModelViewSet):
    queryset = Exemplar.objects.all()
    serializer_class = ExemplarSerializer
    permission_classes = [IsBibliotecario]

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

class EmprestimoViewSet(viewsets.ModelViewSet):
    queryset = Emprestimo.objects.all()
    serializer_class = EmprestimoSerializer
    permission_classes = [IsBibliotecario]
