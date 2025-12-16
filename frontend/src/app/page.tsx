"use client";

import Link from 'next/link';
import { Globe, File, AppWindow } from 'lucide-react'; // Ícones para ilustrar

const WelcomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-4">
      <div className="max-w-2xl">
        <div className="flex justify-center items-center mb-4">
            <AppWindow size={48} className="text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Bem-vindo ao Sistema de Biblioteca</h1>
        <p className="text-gray-600 mb-8">Gerencie seus empréstimos e explore nosso acervo.</p>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">
          <Link 
            href="/livros" 
            className="flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition-all duration-300 w-full md:w-auto"
          >
            <File size={20} />
            Consultar Catálogo
          </Link>
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 w-full md:w-auto"
          >
            <Globe size={20} />
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
