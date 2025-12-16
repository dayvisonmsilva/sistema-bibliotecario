import api from './api';
import { User } from '../context/AuthContext'; // Importar diretamente

// Dados que podem ser atualizados pelo usuário
export type UserUpdateData = Partial<Pick<User, 'nome_completo' | 'email'>>;

export const getUsuario = async (id: number): Promise<User> => {
    try {
        const response = await api.get(`/usuarios/${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar o usuário com id ${id}:`, error);
        throw error;
    }
};

export const updateUsuario = async (id: number, data: UserUpdateData): Promise<User> => {
    try {
        const response = await api.patch(`/usuarios/${id}/`, data);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar o usuário com id ${id}:`, error);
        throw error;
    }
};
