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
        ModelClass = self.Meta.model
        user = ModelClass.objects.create_user(**validated_data)
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

    def validate(self, attrs):
        exemplar = attrs.get('exemplar')
        # Verifica se o exemplar já está em um empréstimo ATIVO
        if Emprestimo.objects.filter(exemplar=exemplar, status='ATIVO').exists():
            raise serializers.ValidationError("Este exemplar já está emprestado.")
        return attrs

    def create(self, validated_data):
        exemplar = validated_data['exemplar']
        livro = exemplar.livro
        
        # Verifica disponibilidade do livro
        if livro.quantidade_disponivel <= 0:
            raise serializers.ValidationError("Não há exemplares disponíveis para este livro.")
            
        # Decrementa a quantidade disponível
        livro.quantidade_disponivel -= 1
        livro.save()
        
        return super().create(validated_data)