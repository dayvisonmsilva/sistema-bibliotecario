"use client";

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-bold">
          Sistema de Biblioteca
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/livros" className="text-gray-300 hover:text-white">
            Livros
          </Link>
          {isAuthenticated ? (
            <>
              {/* Links para Alunos */}
              {user && !user.is_staff && (
                <>
                  <Link href="/emprestimos" className="text-gray-300 hover:text-white">
                    Meus Empréstimos
                  </Link>
                  <Link href="/reservas" className="text-gray-300 hover:text-white">
                    Minhas Reservas
                  </Link>
                </>
              )}

              {/* Links para Bibliotecários */}
              {user && user.is_staff && (
                 <Link href="/emprestimos/registrar" className="text-yellow-400 hover:text-yellow-300 font-bold">
                    Registrar Empréstimo/Devolução
                  </Link>
              )}
              
              <span className="text-gray-400">|</span>
              
              <Link href="/minha-conta" className="text-gray-300 hover:text-white">
                Olá, {user?.nome_completo || user?.username}
              </Link>
              
              <button onClick={logout} className="text-gray-300 hover:text-white">
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/registrar" className="text-gray-300 hover:text-white">
                Criar Conta
              </Link>
              <Link href="/login" className="text-gray-300 hover:text-white">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
