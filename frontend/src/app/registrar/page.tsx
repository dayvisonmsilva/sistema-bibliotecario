"use client";

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { type AxiosError, isAxiosError } from 'axios'; // Import AxiosError and isAxiosError

const RegistrationPage = () => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    nome_completo: '',
    cpf: '',
    matricula: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        nome_completo: formData.nome_completo,
        cpf: formData.cpf,
        matricula: formData.matricula,
      });
      // O redirecionamento ocorre dentro da função de login chamada pelo register
    } catch (error: unknown) { // Catch as unknown
      console.error('Falha no cadastro:', error);
      let errorMsg = 'Ocorreu um erro desconhecido durante o cadastro.';
      if (isAxiosError(error) && error.response && error.response.data) {
        const errorKey = Object.keys(error.response.data)[0];
        errorMsg = `Erro no campo ${errorKey}: ${error.response.data[errorKey][0]}`;
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-xl w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">Crie sua Conta</h1>
        <p className="text-gray-600 mb-6 text-center">Junte-se ao nosso sistema de biblioteca.</p>
        <form onSubmit={handleRegister} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          {error && <p className="text-red-500 text-center text-sm italic mb-4">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Seu username" onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="seu-email@dominio.com" onChange={handleChange} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome_completo">
              Nome Completo
            </label>
            <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="nome_completo" type="text" placeholder="Seu nome completo" onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">
                CPF
              </label>
              <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="cpf" type="text" placeholder="000.000.000-00" onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="matricula">
                Matrícula
              </label>
              <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="matricula" type="text" placeholder="Sua matrícula" onChange={handleChange} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10" id="password" type={showPassword ? 'text' : 'password'} placeholder="********" onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600">
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirmar Senha
              </label>
              <div className="relative">
                <input required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10" id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="********" onChange={handleChange} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600">
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 mt-6">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit" disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
            <Link href="/login" className="font-bold text-sm text-blue-500 hover:text-blue-800">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;