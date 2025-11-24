from rest_framework import serializers
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo

# ---------------------------------------------------------------------
# USUÁRIOS
# ---------------------------------------------------------------------

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nome_completo', 'cpf', 'matricula']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = Usuario.objects.create_user(**validated_data)
        return user

class AlunoSerializer(UsuarioSerializer):
    class Meta(UsuarioSerializer.Meta):
        model = Aluno

class BibliotecarioSerializer(UsuarioSerializer):
    class Meta(UsuarioSerializer.Meta):
        model = Bibliotecario

class LivroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Livro
        fields = '__all__'

class ExemplarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exemplar
        fields = '__all__'

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'

class EmprestimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprestimo
        fields = '__all__'