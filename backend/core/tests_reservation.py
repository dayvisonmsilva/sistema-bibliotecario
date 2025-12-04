from rest_framework.test import APITestCase
from core.models import Aluno, Livro, Exemplar, Reserva, Emprestimo
from core.serializers import ReservaSerializer, EmprestimoSerializer

class ReservationLogicTests(APITestCase):
    def setUp(self):
        self.aluno1 = Aluno.objects.create_user(username='aluno1', password='password', cpf='111', matricula='111', nome_completo='Aluno 1')
        self.aluno2 = Aluno.objects.create_user(username='aluno2', password='password', cpf='222', matricula='222', nome_completo='Aluno 2')
        self.livro = Livro.objects.create(titulo='Livro Teste', autor='Autor', ano=2021, editora='Ed', numero_paginas=100, quantidade_total=1, quantidade_disponivel=1)
        self.exemplar = Exemplar.objects.create(livro=self.livro, codigo_barras='CB001')

    def test_reservation_flow(self):
        # 1. Reserve book for aluno1
        print("Step 1: Reserving book for aluno1")
        data = {'aluno': self.aluno1.id, 'livro': self.livro.id}
        serializer = ReservaSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()
        
        self.livro.refresh_from_db()
        self.assertEqual(self.livro.quantidade_disponivel, 0, "Stock should decrease after reservation")

        # 2. Try to reserve for aluno2 (should fail)
        print("Step 2: Trying to reserve for aluno2 (should fail)")
        data2 = {'aluno': self.aluno2.id, 'livro': self.livro.id}
        serializer2 = ReservaSerializer(data=data2)
        self.assertFalse(serializer2.is_valid(), "Should not allow reservation with 0 stock")

        # 3. Try to loan to aluno2 (should fail)
        print("Step 3: Trying to loan to aluno2 (should fail)")
        data_loan2 = {'aluno': self.aluno2.id, 'exemplar': self.exemplar.id}
        serializer_loan2 = EmprestimoSerializer(data=data_loan2)
        self.assertFalse(serializer_loan2.is_valid(), "Should not allow loan to non-reserver with 0 stock")

        # 4. Loan to aluno1 (has reservation)
        print("Step 4: Loaning to aluno1 (has reservation)")
        data_loan1 = {'aluno': self.aluno1.id, 'exemplar': self.exemplar.id}
        serializer_loan1 = EmprestimoSerializer(data=data_loan1)
        self.assertTrue(serializer_loan1.is_valid(), serializer_loan1.errors)
        serializer_loan1.save()

        self.livro.refresh_from_db()
        self.assertEqual(self.livro.quantidade_disponivel, 0, "Stock should remain 0 after loan with reservation")
        
        # Check reservation deleted
        self.assertFalse(Reserva.objects.filter(aluno=self.aluno1, livro=self.livro).exists(), "Reservation should be consumed")

        # 5. Return book
        print("Step 5: Returning book")
        emprestimo = Emprestimo.objects.get(aluno=self.aluno1, exemplar=self.exemplar)
        serializer_update = EmprestimoSerializer(emprestimo, data={'status': 'CONCLUIDO'}, partial=True)
        self.assertTrue(serializer_update.is_valid())
        serializer_update.save()

        self.livro.refresh_from_db()
        self.assertEqual(self.livro.quantidade_disponivel, 1, "Stock should return to 1")

        # 6. Loan to aluno2 (no reservation)
        print("Step 6: Loaning to aluno2 (no reservation)")
        data_loan2_retry = {'aluno': self.aluno2.id, 'exemplar': self.exemplar.id}
        serializer_loan2_retry = EmprestimoSerializer(data=data_loan2_retry)
        self.assertTrue(serializer_loan2_retry.is_valid())
        serializer_loan2_retry.save()

        self.livro.refresh_from_db()
        self.assertEqual(self.livro.quantidade_disponivel, 0, "Stock should decrease for normal loan")
