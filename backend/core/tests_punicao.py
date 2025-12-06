from rest_framework.test import APITestCase
from core.models import Aluno, Livro, Exemplar, Emprestimo
from core.serializers import EmprestimoSerializer
from datetime import date, timedelta

class PenaltySystemTests(APITestCase):
    def setUp(self):
        self.aluno = Aluno.objects.create_user(username='aluno_punicao', password='password', cpf='999000', matricula='M999000', nome_completo='Aluno Punição')
        self.livro = Livro.objects.create(titulo='Livro Punição', autor='Autor', ano=2021, editora='Ed', numero_paginas=100, quantidade_total=1, quantidade_disponivel=1)
        self.exemplar = Exemplar.objects.create(livro=self.livro, codigo_barras='CB_PUNICAO')

    def test_late_return_applies_block(self):
        print("Test 1: Late return applies block")
        # Create a loan in the past (late)
        emprestimo = Emprestimo.objects.create(aluno=self.aluno, exemplar=self.exemplar)
        emprestimo.data_emprestimo = date.today() - timedelta(days=10)
        emprestimo.data_limite = date.today() - timedelta(days=3) # Deadline was 3 days ago
        emprestimo.save()

        # Update to CONCLUIDO (Return)
        print("Returning late book...")
        serializer = EmprestimoSerializer(emprestimo, data={'status': 'CONCLUIDO'}, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()

        # Check block
        self.aluno.refresh_from_db()
        expected_block = date.today() + timedelta(days=30)
        print(f"Blocked until: {self.aluno.bloqueado_ate} (Expected: {expected_block})")
        self.assertEqual(self.aluno.bloqueado_ate, expected_block, "User should be blocked for 30 days")

    def test_blocked_user_cannot_borrow(self):
        print("Test 2: Blocked user cannot borrow")
        # Manually block user
        self.aluno.bloqueado_ate = date.today() + timedelta(days=5)
        self.aluno.save()

        # Try to borrow
        data = {'aluno': self.aluno.id, 'exemplar': self.exemplar.id}
        serializer = EmprestimoSerializer(data=data)
        
        is_valid = serializer.is_valid()
        print(f"Validation result: {is_valid}")
        if not is_valid:
            print(f"Errors: {serializer.errors}")
            
        self.assertFalse(is_valid, "Should not allow loan for blocked user")
        self.assertIn("bloqueado por atraso", str(serializer.errors))

    def test_on_time_return_no_block(self):
        print("Test 3: On-time return -> No block")
        emprestimo = Emprestimo.objects.create(aluno=self.aluno, exemplar=self.exemplar)
        # Limit is in future
        emprestimo.data_limite = date.today() + timedelta(days=1)
        emprestimo.save()

        # Return today
        serializer = EmprestimoSerializer(emprestimo, data={'status': 'CONCLUIDO'}, partial=True)
        self.assertTrue(serializer.is_valid())
        serializer.save()

        self.aluno.refresh_from_db()
        print(f"Blocked until: {self.aluno.bloqueado_ate}")
        self.assertIsNone(self.aluno.bloqueado_ate, "User should NOT be blocked")
