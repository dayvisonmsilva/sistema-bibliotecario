from rest_framework import serializers
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo
from datetime import date

# ---------------------------------------------------------------------
# USUÁRIOS
# ---------------------------------------------------------------------

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nome_completo', 'cpf', 'matricula', 'password']
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
        read_only_fields = ['quantidade_total', 'quantidade_disponivel']
    
class ExemplarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exemplar
        fields = '__all__'

    def create(self, validated_data):
        exemplar = super().create(validated_data)
        livro = exemplar.livro
        livro.quantidade_total += 1
        livro.quantidade_disponivel += 1
        livro.save()
        return exemplar

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = '__all__'

class EmprestimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprestimo
        fields = '__all__'
        read_only_fields = ['data_limite', 'data_devolucao']

    def validate(self, attrs):
        exemplar = attrs.get('exemplar')
        # Verifica se o exemplar já está em um empréstimo ATIVO
        if Emprestimo.objects.filter(exemplar=exemplar, status='ATIVO').exists():
            raise serializers.ValidationError("Este exemplar já está emprestado.")
        
        if not self.instance and exemplar.livro.quantidade_disponivel <= 0:
            raise serializers.ValidationError("Não há exemplares disponíveis.")
        return attrs

    def create(self, validated_data):
        exemplar = validated_data['exemplar']
        livro = exemplar.livro
            
        # Decrementa a quantidade disponível
        livro.quantidade_disponivel -= 1
        livro.save()
        return super().create(validated_data)

    def update(self, instance, validated_data):
        novo_status = validated_data.get('status')
        
        if novo_status == 'CONCLUIDO' and instance.status != 'CONCLUIDO':
            livro = instance.exemplar.livro
            livro.quantidade_disponivel += 1
            livro.save()
            
            if not validated_data.get('data_devolucao'):
                validated_data['data_devolucao'] = date.today()

        return super().update(instance, validated_data)