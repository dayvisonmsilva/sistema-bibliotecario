// src/components/auth/RegistrationForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import { Eye, EyeOff } from 'lucide-react'; 

const RegistrationForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    nome_completo: '',
    email: '',
    cpf: '',
    matricula: '',
    password: '',
    password2: '' 
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [showPassword2, setShowPassword2] = useState(false); 


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      setError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.post('/alunos/', formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = 'Ocorreu um erro ao realizar o cadastro.';
      if (errorData) {
        const firstErrorKey = Object.keys(errorData)[0];
        errorMessage = `${firstErrorKey}: ${errorData[firstErrorKey]}`;
      }
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nome_completo">Nome Completo</label>
        <input name="nome_completo" value={formData.nome_completo} onChange={handleChange} required className="input" />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
        <input name="username" value={formData.username} onChange={handleChange} required className="input" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required className="input" />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">CPF</label>
          <input name="cpf" value={formData.cpf} onChange={handleChange} required className="input" placeholder="000.000.000-00" />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="matricula">Matrícula</label>
        <input name="matricula" value={formData.matricula} onChange={handleChange} required className="input" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Senha</label>
          <div className="relative">
            <input name="password" 
                   type={showPassword ? 'text' : 'password'} 
                   value={formData.password} 
                   onChange={handleChange} required 
                   className="input pr-10" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password2">Confirmar Senha</label>
          <div className="relative">
            <input name="password2" 
                   type={showPassword2 ? 'text' : 'password'} 
                   value={formData.password2} 
                   onChange={handleChange} required 
                   className="input pr-10" />
            <button
              type="button"
              onClick={() => setShowPassword2(!showPassword2)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
            >
              {showPassword2 ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          {loading ? 'Cadastrando...' : 'Criar Conta'}
        </button>
        <button type="button" onClick={() => router.push('/login')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Cancelar
        </button>
      </div>
       <style jsx>{`
        .input {
          box-shadow: none;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          width: 100%;
          padding: 0.5rem 0.75rem;
          color: #4a5568;
          line-height: 1.25;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 1px #3b82f6;
        }
      `}</style>
    </form>
  );
};

export default RegistrationForm;
