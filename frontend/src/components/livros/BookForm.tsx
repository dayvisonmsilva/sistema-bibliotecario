"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Livro, LivroData, createLivro, updateLivro } from '../../lib/bookService';

interface BookFormProps {
  livro?: Livro; // Opcional, para modo de edição
}

const BookForm = ({ livro }: BookFormProps) => {
  const router = useRouter();
  const [formData, setFormData] = useState<LivroData>({
    titulo: '',
    autor: '',
    editora: '',
    ano: new Date().getFullYear(),
    numero_paginas: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = livro !== undefined;

  useEffect(() => {
    if (isEditMode && livro) {
      setFormData({
        titulo: livro.titulo,
        autor: livro.autor,
        editora: livro.editora,
        ano: livro.ano,
        numero_paginas: livro.numero_paginas,
      });
    }
  }, [livro, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    setFormData({
      ...formData,
      [id]: type === 'number' ? parseInt(value, 10) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditMode && livro) {
        await updateLivro(livro.id, formData);
      } else {
        await createLivro(formData);
      }
      router.push('/livros'); // Redireciona para o catálogo após sucesso
      router.refresh(); // Força a atualização dos dados na página de catálogo
    } catch (err) {
      setError('Ocorreu um erro ao salvar o livro. Verifique os campos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? 'Editar Livro' : 'Cadastrar Novo Livro'}
      </h2>
      <form onSubmit={handleSubmit}>
        {error && <p className="text-red-500 text-center text-sm italic mb-4">{error}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="titulo">
              Título
            </label>
            <input required id="titulo" type="text" value={formData.titulo} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="autor">
              Autor
            </label>
            <input required id="autor" type="text" value={formData.autor} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="editora">
              Editora
            </label>
            <input required id="editora" type="text" value={formData.editora} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ano">
              Ano de Publicação
            </label>
            <input required id="ano" type="number" value={formData.ano} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="numero_paginas">
              Número de Páginas
            </label>
            <input required id="numero_paginas" type="number" value={formData.numero_paginas} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 mt-8">
          <button type="button" onClick={() => router.back()} className="text-gray-600 hover:text-gray-800">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {loading ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Cadastrar Livro')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;