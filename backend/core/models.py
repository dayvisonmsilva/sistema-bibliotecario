from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date, timedelta

class Usuario(AbstractUser):
    nome_completo = models.CharField(max_length=255)
    cpf = models.CharField(max_length=14, unique=True, verbose_name="CPF")
    matricula = models.CharField(max_length=20, unique=True, verbose_name="Matrícula")

    # Configurações necessárias para o Django Custom User
    REQUIRED_FIELDS = ['email', 'cpf', 'matricula']
    
    # Resolve conflitos de herança do Django
    groups = models.ManyToManyField(
        'auth.Group', verbose_name='groups', blank=True,
        related_name="custom_usuario_set", related_query_name="user"
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission', verbose_name='user permissions', blank=True,
        related_name="custom_usuario_set", related_query_name="user"
    )

    class Meta:
        verbose_name = 'Usuário'

    def __str__(self):
        return f"{self.matricula} - {self.username}"


class Aluno(Usuario):
    bloqueado_ate = models.DateField(null=True, blank=True)

    class Meta:
        verbose_name = 'Aluno'


class Bibliotecario(Usuario):
    class Meta:
        verbose_name = 'Bibliotecário'

class Livro(models.Model):
    # Atributos do diagrama
    titulo = models.CharField(max_length=255)
    autor = models.CharField(max_length=255)
    ano = models.IntegerField()
    editora = models.CharField(max_length=100)
    numero_paginas = models.IntegerField()
    
    quantidade_total = models.IntegerField(default=0)
    quantidade_disponivel = models.IntegerField(default=0)

    def __str__(self):
        return self.titulo


class Exemplar(models.Model):
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE, related_name='exemplares')
    codigo_barras = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return f"{self.livro.titulo} - {self.codigo_barras}"

class Reserva(models.Model):
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE) 
    data_reserva = models.DateField(auto_now_add=True)
    data_validade = models.DateField(editable=False, null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.id:
            self.data_validade = date.today() + timedelta(days=3) # Regra de 3 dias
        super().save(*args, **kwargs)
        
    def __str__(self):
        return f"Reserva: {self.aluno} - {self.livro}"


class Emprestimo(models.Model):
    STATUS_CHOICES = [
        ('ATIVO', 'Ativo'),
        ('CONCLUIDO', 'Concluído'),
        ('ATRASADO', 'Atrasado'),
    ]

    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    exemplar = models.ForeignKey(Exemplar, on_delete=models.CASCADE)
    data_emprestimo = models.DateField(auto_now_add=True)
    data_devolucao = models.DateField(null=True, blank=True)
    data_limite = models.DateField(editable=False, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ATIVO')

    def save(self, *args, **kwargs):
        if not self.id:
            self.data_limite = date.today() + timedelta(days=7) # Regra de 7 dias
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Empréstimo: {self.aluno} - {self.exemplar.codigo_barras}"