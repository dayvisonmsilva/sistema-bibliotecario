from django.db import models
from django.contrib.auth.models import AbstractUser

class Usuario(AbstractUser):
    TIPOS = (('ALUNO', 'Aluno'), ('BIBLIOTECARIO', 'Bibliotecário'))

    # O AbstractUser já tem: username, first_name, last_name, email, password
    cpf = models.CharField(max_length=14, unique=True)
    matricula = models.CharField(max_length=20, unique=True)
    tipo_usuario = models.CharField(max_length=15, choices=TIPOS, default='ALUNO')

    # Resolve conflitos de herança do Django (obrigatório ao extender AbstractUser)
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name="custom_usuario_set",
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="custom_usuario_set",
        related_query_name="user",
    )

    class Meta:
        verbose_name = 'Usuário'

class Livro(models.Model):
    titulo = models.CharField(max_length=200)
    autor = models.CharField(max_length=200)
    ano = models.IntegerField()
    editora = models.CharField(max_length=200)
    numero_paginas = models.IntegerField()
    quantidade_total = models.IntegerField(default=0)
    quantidade_disponivel = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.titulo} - {self.autor}"

class Exemplar(models.Model):
    codigo_barras = models.CharField(max_length=50, unique=True)
    livro = models.ForeignKey(Livro, on_delete=models.CASCADE, related_name='exemplares')

    def __str__(self):
        return f"{self.livro.titulo} - {self.codigo_barras}"