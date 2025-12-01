from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from .models import Usuario, Aluno, Livro, Exemplar, Emprestimo
from rest_framework_simplejwt.tokens import RefreshToken

class CoreAPITests(APITestCase):
    def setUp(self):
        # Create a user for authentication
        self.user = Usuario.objects.create_user(
            username='testuser',
            password='testpassword',
            email='test@example.com',
            cpf='12345678901',
            matricula='2023001'
        )
        
        # Generate token
        refresh = RefreshToken.for_user(self.user)
        self.token = str(refresh.access_token)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Create a student for loan tests
        self.aluno = Aluno.objects.create(
            username='aluno1',
            password='password',
            email='aluno1@example.com',
            cpf='11122233344',
            matricula='2023002',
            nome_completo='Aluno Teste'
        )

    def test_create_aluno_without_cpf(self):
        """
        Test A: Tentar criar um aluno sem CPF (deve falhar).
        """
        url = reverse('aluno-list')
        data = {
            'username': 'aluno_sem_cpf',
            'password': 'password',
            'email': 'aluno_sem_cpf@example.com',
            'matricula': '2023999',
            'nome_completo': 'Aluno Sem CPF'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cpf', response.data)

    def test_loan_success_decrements_stock(self):
        """
        Test B: Fluxo de Empréstimo (Sucesso): Criar um livro com estoque 1, 
        realizar empréstimo e verificar se o estoque caiu para 0.
        """
        # Create Book with stock 1
        livro = Livro.objects.create(
            titulo='Livro Teste',
            autor='Autor Teste',
            ano=2023,
            editora='Editora Teste',
            numero_paginas=100,
            quantidade_total=1,
            quantidade_disponivel=1
        )
        exemplar = Exemplar.objects.create(livro=livro, codigo_barras='CB001')

        url = reverse('emprestimo-list')
        data = {
            'aluno': self.aluno.id,
            'exemplar': exemplar.id
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify stock decrement
        livro.refresh_from_db()
        self.assertEqual(livro.quantidade_disponivel, 0)

    def test_loan_blocked_if_active(self):
        """
        Test C: Fluxo de Empréstimo (Bloqueio): Tentar emprestar um exemplar 
        que já está com status 'ATIVO' (deve retornar erro 400).
        """
        livro = Livro.objects.create(
            titulo='Livro Bloqueio',
            autor='Autor',
            ano=2023,
            editora='Editora',
            numero_paginas=100,
            quantidade_total=2,
            quantidade_disponivel=2
        )
        exemplar = Exemplar.objects.create(livro=livro, codigo_barras='CB002')
        
        # Create first active loan
        Emprestimo.objects.create(
            aluno=self.aluno,
            exemplar=exemplar,
            status='ATIVO'
        )
        
        # Try to create another loan for the same exemplar
        url = reverse('emprestimo-list')
        data = {
            'aluno': self.aluno.id,
            'exemplar': exemplar.id
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Depending on how DRF formats the error, it might be a list or string
        # We expect validation error
        self.assertTrue(response.data) 

    def test_unauthorized_access(self):
        """
        Test D: Autenticação: Tentar acessar endpoints protegidos sem token (deve retornar 401).
        """
        self.client.credentials() # Clear credentials
        url = reverse('livro-list')
        
        # Try to create a book (requires authentication)
        data = {
            'titulo': 'Livro Proibido',
            'autor': 'Autor',
            'ano': 2023,
            'editora': 'Editora',
            'numero_paginas': 100
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
