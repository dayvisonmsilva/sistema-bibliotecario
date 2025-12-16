import api from './api';
import { Livro } from './bookService';

export interface Reserva {
  id: number;
  aluno: number;
  livro: Livro;
  data_reserva: string;
  data_validade: string;
}

// O backend espera o ID do aluno e do livro
export interface ReservaData {
    aluno: number;
    livro: number;
}

export const getMinhasReservas = async (alunoId: number): Promise<Reserva[]> => {
  try {
    // A API filtra as reservas pelo ID do aluno passado como query param
    const response = await api.get('/reservas/', {
      params: { aluno: alunoId },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar as reservas do aluno:", error);
    throw error;
  }
};

export const createReserva = async (data: ReservaData): Promise<Reserva> => {
    try {
        const response = await api.post('/reservas/', data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar reserva:", error);
        throw error;
    }
};

export const cancelReserva = async (id: number): Promise<void> => {
    try {
        await api.delete(`/reservas/${id}/`);
    } catch (error) {
        console.error(`Erro ao cancelar a reserva com id ${id}:`, error);
        throw error;
    }
};
