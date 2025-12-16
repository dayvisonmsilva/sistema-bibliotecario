import api from './api';
import { Livro } from './bookService';

export interface Exemplar {
    id: number;
    livro: Livro;
    codigo_barras: string;
}

export interface ExemplarCreateData {
    livro: number; // Apenas o ID do livro é necessário para a criação
    codigo_barras: string;
}

export const getExemplares = async (livroId: number): Promise<Exemplar[]> => {
    try {
        const response = await api.get('/exemplares/', {
            params: { livro: livroId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar exemplares:", error);
        throw error;
    }
};

export const createExemplar = async (data: ExemplarCreateData): Promise<Exemplar> => {
    try {
        const response = await api.post('/exemplares/', data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar exemplar:", error);
        throw error;
    }
};

export const deleteExemplar = async (id: number): Promise<void> => {
    try {
        await api.delete(`/exemplares/${id}/`);
    } catch (error) {
        console.error(`Erro ao deletar o exemplar com id ${id}:`, error);
        throw error;
    }
};
