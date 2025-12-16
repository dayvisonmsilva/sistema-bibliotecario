import api from './api';
import { Exemplar } from './exemplarService';
import { isAxiosError } from 'axios';

export interface Emprestimo {
    id: number;
    aluno: number;
    exemplar: Exemplar;
    data_emprestimo: string;
    data_devolucao: string | null;
    data_limite: string;
    status: 'ATIVO' | 'CONCLUIDO' | 'ATRASADO';
}

export interface EmprestimoCreateData {
    aluno_cpf: string;
    aluno_senha: string;
    exemplar_codigo: string;
}

export interface DevolucaoData {
    exemplar_codigo: string;
}

const handleApiError = (error: unknown, defaultMessage: string) => {
    console.error(defaultMessage, error);
    
    if (isAxiosError(error) && error.response && error.response.data) {
        const data = error.response.data;

        if (data.detail) {
            throw new Error(data.detail);
        }

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            throw new Error(data.non_field_errors[0]);
        }

        const keys = Object.keys(data);
        if (keys.length > 0) {
            const firstKey = keys[0];
            const firstError = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
            throw new Error(`${firstKey}: ${firstError}`);
        }
    }
    
    throw new Error(defaultMessage);
};

export const getMeusEmprestimos = async (alunoId: number): Promise<Emprestimo[]> => {
    try {
        const response = await api.get('/emprestimos/');
        
        if (response.data.results) {
            return response.data.results;
        } else if (Array.isArray(response.data)) {
            return response.data;
        }
        return [];
    } catch (error) {
        handleApiError(error, "Erro ao buscar empréstimos.");
        return []; 
    }
};

export const renovarEmprestimo = async (id: number): Promise<Emprestimo> => {
    try {
        const response = await api.patch(`/emprestimos/${id}/renovar/`);
        return response.data;
    } catch (error) {
        return handleApiError(error, "Erro ao renovar o empréstimo.") as any;
    }
};

export const createEmprestimo = async (data: EmprestimoCreateData): Promise<Emprestimo> => {
    try {
        const response = await api.post('/emprestimos/', data);
        return response.data;
    } catch (error) {
        return handleApiError(error, "Erro ao criar empréstimo.") as any;
    }
};

export const devolverEmprestimo = async (data: DevolucaoData): Promise<{ detail: string }> => {
    try {
        const response = await api.post('/emprestimos/devolucao/', data);
        return response.data;
    } catch (error) {
        return handleApiError(error, "Erro ao registrar devolução.") as any;
    }
};