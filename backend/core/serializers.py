from rest_framework import serializers
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo
from datetime import date
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adiciona dados do usuário à resposta
        data['id'] = self.user.id
        data['nome_completo'] = self.user.nome_completo
        
        # Define o tipo de usuário
        if self.user.is_staff or hasattr(self.user, 'bibliotecario'):
            data['tipo_usuario'] = 'bibliotecario'
        else:
            data['tipo_usuario'] = 'aluno'
            
        return data

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

    def validate(self, attrs):
        livro = attrs.get('livro')
        if not self.instance and livro.quantidade_disponivel <= 0:
            raise serializers.ValidationError("Não há exemplares disponíveis para reserva.")
        return attrs

    def create(self, validated_data):
        livro = validated_data['livro']
        livro.quantidade_disponivel -= 1
        livro.save()
        return super().create(validated_data)

class EmprestimoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emprestimo
        fields = '__all__'
        read_only_fields = ['data_limite', 'data_devolucao']

    def validate(self, attrs):
        if not self.instance:
            exemplar = attrs.get('exemplar')
            aluno = attrs.get('aluno')
            
            # Verifica se o exemplar já está em um empréstimo ATIVO
            if Emprestimo.objects.filter(exemplar=exemplar, status='ATIVO').exists():
                raise serializers.ValidationError("Este exemplar já está emprestado.")
            
            # Verifica se existe reserva para este aluno e livro
            has_reservation = Reserva.objects.filter(aluno=aluno, livro=exemplar.livro).exists()

            # Se NÃO tem reserva, precisa ter estoque disponível
            if not has_reservation:
                if exemplar.livro.quantidade_disponivel <= 0:
                    raise serializers.ValidationError("Não há exemplares disponíveis.")
        return attrs

    def create(self, validated_data):
        exemplar = validated_data['exemplar']
        aluno = validated_data['aluno']
        livro = exemplar.livro
        
        # Verifica e consome reserva
        reserva = Reserva.objects.filter(aluno=aluno, livro=livro).first()
        
        if reserva:
            reserva.delete()
            # Não decrementa estoque pois a reserva já o fez
        else:
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