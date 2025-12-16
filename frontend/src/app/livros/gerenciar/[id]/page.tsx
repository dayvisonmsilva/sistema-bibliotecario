"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuthGuard from '../../../../components/auth/AuthGuard';
import BookForm from '../../../../components/livros/BookForm';
import { getLivroById, Livro } from '../../../../lib/bookService';

const EditBookPage = () => {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [livro, setLivro] = useState<Livro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchLivro = async () => {
        try {
          const numericId = parseInt(id, 10);
          if (isNaN(numericId)) {
            setError("ID do livro inválido.");
            return;
          }
          const data = await getLivroById(numericId);
          setLivro(data);
        } catch (err) {
          setError("Não foi possível carregar os dados do livro.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchLivro();
    }
  }, [id]);

  return (
    <AuthGuard allowedRoles={['bibliotecario']}>
      {loading && <p className="text-center p-8">Carregando livro...</p>}
      {error && <p className="text-center text-red-500 p-8">{error}</p>}
      {!loading && !error && livro && <BookForm livro={livro} />}
    </AuthGuard>
  );
};

export default EditBookPage;