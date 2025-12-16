import api from './api';

export interface Livro {
  id: number;
  titulo: string;
  autor: string;
  ano: number;
  editora: string;
  numero_paginas: number;
  quantidade_disponivel: number;
  quantidade_total: number;
}

// Para criação e atualização, alguns campos não são necessários ou são somente leitura
export type LivroData = Omit<Livro, 'id' | 'quantidade_disponivel' | 'quantidade_total'>;

export const getLivros = async (searchTerm: string = ''): Promise<Livro[]> => {
  try {
    const response = await api.get('/livros/', {
      params: {
        search: searchTerm,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    throw error;
  }
};

export const getLivroById = async (id: number): Promise<Livro> => {
  try {
    const response = await api.get(`/livros/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar o livro com id ${id}:`, error);
    throw error;
  }
}

export const createLivro = async (data: LivroData): Promise<Livro> => {
    try {
        const response = await api.post('/livros/', data);
        return response.data;
    } catch (error) {
        console.error("Erro ao criar livro:", error);
        throw error;
    }
};

export const updateLivro = async (id: number, data: Partial<LivroData>): Promise<Livro> => {
    try {
        const response = await api.put(`/livros/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar o livro com id ${id}:`, error);
        throw error;
    }
};

export const deleteLivro = async (id: number): Promise<void> => {
    try {
        await api.delete(`/livros/${id}/`);
    } catch (error) {
        console.error(`Erro ao deletar o livro com id ${id}:`, error);
        throw error;
    }
};
