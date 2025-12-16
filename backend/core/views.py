from rest_framework import viewsets, permissions, filters
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo
from .serializers import (
    UsuarioSerializer, AlunoSerializer, BibliotecarioSerializer,
    LivroSerializer, ExemplarSerializer, ReservaSerializer, EmprestimoSerializer
)
from .permissions import IsBibliotecario
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import timedelta
from django.utils import timezone
from django.db.models import Case, When, Value, IntegerField

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAuthenticated]

class AlunoViewSet(viewsets.ModelViewSet):
    queryset = Aluno.objects.all()
    serializer_class = AlunoSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            self.permission_classes = [permissions.AllowAny]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

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
    serializer_class = EmprestimoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Emprestimo.objects.all().order_by('-data_emprestimo')

        if hasattr(user, 'aluno'):
            return queryset.filter(aluno=user.aluno)
        
        return queryset

    @action(detail=True, methods=['post', 'patch'])
    def renovar(self, request, pk=None):
        emprestimo = self.get_object()
        
        emprestimo.data_limite += timedelta(days=7)
        emprestimo.save()
        
        serializer = self.get_serializer(emprestimo)
        return Response({'mensagem': 'Renovado com sucesso', 'dados': serializer.data})
    
    @action(detail=False, methods=['post'])
    def devolucao(self, request):
        exemplar_codigo = request.data.get('exemplar_codigo')
        
        if not exemplar_codigo:
            return Response({'erro': 'Código do exemplar não fornecido.'}, status=400)

        try:
            emprestimo = Emprestimo.objects.get(
                exemplar__codigo_barras=exemplar_codigo,
                status='ATIVO'
            )
            
            emprestimo.data_devolucao = timezone.now().date()
            emprestimo.status = 'CONCLUIDO'
            emprestimo.save()
            
            livro = emprestimo.exemplar.livro
            livro.quantidade_disponivel += 1
            livro.save()
            
            serializer = self.get_serializer(emprestimo)
            return Response({'mensagem': 'Devolução registrada com sucesso', 'dados': serializer.data})
            
        except Emprestimo.DoesNotExist:
            return Response({'erro': 'Empréstimo ativo não encontrado para este exemplar.'}, status=404)