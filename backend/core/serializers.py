from rest_framework import serializers
from .models import Usuario, Aluno, Bibliotecario, Livro, Exemplar, Reserva, Emprestimo
from datetime import date

# ---------------------------------------------------------------------
# USUÁRIOS
# ---------------------------------------------------------------------

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nome_completo', 'cpf', 'matricula', 'password', 'is_staff']
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
    def create(self, validated_data):
        validated_data['is_staff'] = True
        return super().create(validated_data)

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

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['livro'] = LivroSerializer(instance.livro).data
        representation['aluno'] = AlunoSerializer(instance.aluno).data
        return representation

class ExemplarDetalhadoSerializer(ExemplarSerializer):
    livro = LivroSerializer(read_only=True)

class EmprestimoSerializer(serializers.ModelSerializer):
    aluno_cpf = serializers.CharField(write_only=True)
    aluno_senha = serializers.CharField(write_only=True)
    exemplar_codigo = serializers.CharField(write_only=True)

    aluno = AlunoSerializer(read_only=True)
    exemplar = ExemplarDetalhadoSerializer(read_only=True)

    class Meta:
        model = Emprestimo
        fields = ['id', 'aluno', 'exemplar', 'aluno_cpf', 'aluno_senha', 'exemplar_codigo', 
                 'data_emprestimo', 'data_devolucao', 'data_limite', 'status']
        read_only_fields = ['data_limite', 'data_devolucao', 'status', 'aluno', 'exemplar']

    def validate(self, attrs):
        cpf = attrs.get('aluno_cpf')
        senha = attrs.get('aluno_senha')
        
        if not cpf:
             raise serializers.ValidationError({"aluno_cpf": "Este campo é obrigatório."})

        try:
            aluno = Aluno.objects.get(cpf=cpf)
        except Aluno.DoesNotExist:
            raise serializers.ValidationError({"aluno_cpf": "Aluno não encontrado com este CPF."})

        if not aluno.check_password(senha):
            raise serializers.ValidationError({"aluno_senha": "Senha do aluno incorreta."})

        codigo = attrs.get('exemplar_codigo')
        
        if not codigo:
             raise serializers.ValidationError({"exemplar_codigo": "Este campo é obrigatório."})

        try:
            exemplar = Exemplar.objects.get(codigo_barras=codigo)
        except Exemplar.DoesNotExist:
            raise serializers.ValidationError({"exemplar_codigo": "Exemplar não encontrado."})

        if Emprestimo.objects.filter(exemplar=exemplar, status='ATIVO').exists():
            raise serializers.ValidationError({"exemplar_codigo": "Este exemplar já está emprestado."})
        
        if exemplar.livro.quantidade_disponivel <= 0:
            raise serializers.ValidationError({"non_field_errors": "Não há exemplares disponíveis no estoque."})

        attrs['aluno_obj'] = aluno
        attrs['exemplar_obj'] = exemplar
        return attrs

    def create(self, validated_data):
        aluno = validated_data.pop('aluno_obj')
        exemplar = validated_data.pop('exemplar_obj')
        
        validated_data.pop('aluno_cpf', None)
        validated_data.pop('aluno_senha', None)
        validated_data.pop('exemplar_codigo', None)

        livro = exemplar.livro
        livro.quantidade_disponivel -= 1
        livro.save()

        Reserva.objects.filter(aluno=aluno, livro=livro).delete()

        emprestimo = Emprestimo.objects.create(aluno=aluno, exemplar=exemplar, **validated_data)
        return emprestimo
    
    def update(self, instance, validated_data):
        novo_status = validated_data.get('status')
        if novo_status == 'CONCLUIDO' and instance.status != 'CONCLUIDO':
            livro = instance.exemplar.livro
            livro.quantidade_disponivel += 1
            livro.save()
            if not validated_data.get('data_devolucao'):
                validated_data['data_devolucao'] = date.today()
        return super().update(instance, validated_data)