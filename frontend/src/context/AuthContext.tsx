"use client";

import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';
import { jwtDecode }from 'jwt-decode';
import api from '../lib/api';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

// Define e exporta a interface para os dados do usuário
export interface User {
  id: number;
  user_id: number; // o payload do token simple-jwt tem user_id
  username: string;
  email: string;
  nome_completo: string;
  cpf: string;
  matricula: string;
  is_staff: boolean; // para identificar bibliotecarios
}

// Interface para os dados de registro
interface RegistrationData {
  username: string; // O username será a matrícula
  email: string;
  password: string;
  nome_completo: string;
  cpf: string;
  matricula: string;
}

// Define a interface para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>; // Expõe o setter
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  });
  const [user, setUser] = useState<User | null>(() => {
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    return userData ? JSON.parse(userData) : null;
  });
  const router = useRouter();

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/token/', { username, password });
      const { access, refresh } = response.data;
      
      const decodedToken: { user_id: number } = jwtDecode(access);
      
      localStorage.setItem('accessToken', access);

      const userResponse = await api.get(`/usuarios/${decodedToken.user_id}/`);
      const userData: User = userResponse.data;

      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(userData));

      setAccessToken(access);
      setUser(userData);

      router.push('/livros');

    } catch (error) { // Catch as unknown
      console.error('Falha no login:', error);
      localStorage.removeItem('accessToken');
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data?.detail || 'Usuário ou senha inválidos.');
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Ocorreu um erro desconhecido.');
    }
  };

  const register = async (data: RegistrationData) => {
    try {
      await api.post('/alunos/', data);
      await login(data.username, data.password);

    } catch (error) { // Catch as unknown
      console.error('Falha no cadastro:', error);
      if (isAxiosError(error) && error.response && error.response.data) {
        const errorKey = Object.keys(error.response.data)[0];
        const errorMessage = error.response.data[errorKey][0];
        throw new Error(`Erro no campo ${errorKey}: ${errorMessage}`);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Não foi possível realizar o cadastro. Verifique os dados.');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setAccessToken(null);
    setUser(null);
    router.push('/');
  };

  const isAuthenticated = !!accessToken;

  const value = {
    user,
    accessToken,
    isAuthenticated,
    login,
    register,
    logout,
    setUser, // Adiciona o setter ao valor do contexto
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
