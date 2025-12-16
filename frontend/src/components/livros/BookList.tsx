"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getLivros, deleteLivro, Livro } from '../../lib/bookService';
import { createReserva } from '../../lib/reservaService';
import { useAuth } from '../../context/AuthContext';
import { Search, Edit, Trash2, PlusCircle, BookCopy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const BookList = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [livros, setLivros] = useState<Livro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchLivros = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLivros(debouncedSearchTerm);
      setLivros(data);
    } catch {
      setError('Não foi possível carregar os livros.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchLivros();
  }, [fetchLivros]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este livro? Esta ação não pode ser desfeita.')) {
        try {
            await deleteLivro(id);
            setLivros(prevLivros => prevLivros.filter(livro => livro.id !== id));
        } catch {
            alert('Não foi possível excluir o livro. Verifique se ele não possui exemplares emprestados ou reservados.');
        }
    }
  };

  const handleReserve = async (livroId: number) => {
    if (!isAuthenticated || !user) {
        router.push('/login');
        return;
    }
    if(user.is_staff) {
        alert('Bibliotecários não podem reservar livros.');
        return;
    }

    try {
        await createReserva({ aluno: user.id, livro: livroId });
        alert('Livro reservado com sucesso! Você tem 3 dias para retirá-lo.');
        setLivros(prevLivros => 
            prevLivros.map(l => 
                l.id === livroId 
                ? { ...l, quantidade_disponivel: l.quantidade_disponivel - 1 }
                : l
            )
        );
    } catch (error: unknown) {
        let errorMsg = 'Não foi possível reservar o livro.';
        if (isAxiosError(error) && error.response) {
            errorMsg = error.response.data?.detail || errorMsg;
        }
        alert(errorMsg);
    }
  };

  const isBibliotecario = useMemo(() => user?.is_staff === true, [user]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Catálogo de Livros</h2>
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
         {isBibliotecario && (
            <Link href="/livros/gerenciar" className="btn-primary flex items-center gap-2">
                <PlusCircle size={20} />
                Novo Livro
            </Link>
        )}
      </div>

      {loading && <p className="text-center text-gray-500">Carregando...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livros.length > 0 ? (
            livros.map((livro) => (
              <div key={livro.id} className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                  <h3 className="text-lg font-bold text-blue-600">{livro.titulo}</h3>
                  <p className="text-sm text-gray-600 mb-2">por {livro.autor}</p>
                  <p className="text-xs text-gray-500">{livro.editora} - {livro.ano}</p>
                </div>
                <div className="mt-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        livro.quantidade_disponivel > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                        {livro.quantidade_disponivel > 0 ? 'Disponível' : 'Indisponível'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{livro.quantidade_disponivel} de {livro.quantidade_total} exemplares disponíveis</p>
                </div>
                <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t">
                    {isBibliotecario ? (
                        <>
                           <Link href={`/livros/gerenciar/${livro.id}`} className="text-blue-500 hover:text-blue-700" title="Editar Livro">
                                <Edit size={18} />
                           </Link>
                           <Link href={`/livros/gerenciar/${livro.id}/exemplares`} className="text-green-600 hover:text-green-800" title="Gerenciar Exemplares">
                                <BookCopy size={18} />
                           </Link>
                           <button onClick={() => handleDelete(livro.id)} className="text-red-500 hover:text-red-700" title="Excluir Livro">
                                <Trash2 size={18}/>
                           </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => handleReserve(livro.id)}
                            disabled={livro.quantidade_disponivel === 0}
                            className="text-sm bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Reservar
                        </button>
                    )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">Nenhum livro encontrado.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default BookList;