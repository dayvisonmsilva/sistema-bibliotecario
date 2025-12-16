"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '../../../../../components/auth/AuthGuard';
import { getLivroById, Livro } from '../../../../../lib/bookService';
import { getExemplares, createExemplar, deleteExemplar, Exemplar } from '../../../../../lib/exemplarService';
import { isAxiosError } from 'axios';
import { Trash2, PlusCircle, ArrowLeft } from 'lucide-react';

const GerenciarExemplaresPage = () => {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    
    const [livro, setLivro] = useState<Livro | null>(null);
    const [exemplares, setExemplares] = useState<Exemplar[]>([]);
    const [newCodigoBarras, setNewCodigoBarras] = useState('');

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const livroId = parseInt(id, 10);

    const fetchData = useCallback(async () => {
        if (isNaN(livroId)) {
            setError("ID do livro inválido.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const livroData = await getLivroById(livroId);
            const exemplaresData = await getExemplares(livroId);
            setLivro(livroData);
            setExemplares(exemplaresData);
        } catch {
            setError("Não foi possível carregar os dados.");
        } finally {
            setLoading(false);
        }
    }, [livroId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddExemplar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCodigoBarras.trim()) {
            alert("O código de barras não pode estar vazio.");
            return;
        }
        try {
            const novoExemplar = await createExemplar({ livro: livroId, codigo_barras: newCodigoBarras });
            setExemplares(prev => [...prev, novoExemplar]);
            setNewCodigoBarras(''); // Limpa o input
        } catch (err: unknown) {
            let errorMsg = "Não foi possível adicionar o exemplar.";
            if (isAxiosError(err) && err.response?.data?.codigo_barras) {
                errorMsg = `Código de Barras: ${err.response.data.codigo_barras[0]}`;
            }
            alert(errorMsg);
        }
    };

    const handleDeleteExemplar = async (exemplarId: number) => {
        if (window.confirm("Tem certeza que deseja excluir este exemplar?")) {
            try {
                await deleteExemplar(exemplarId);
                setExemplares(prev => prev.filter(ex => ex.id !== exemplarId));
            } catch {
                alert("Não foi possível excluir o exemplar. Verifique se ele não está em um empréstimo ativo.");
            }
        }
    };

    return (
        <AuthGuard allowedRoles={['bibliotecario']}>
            <div className="max-w-4xl mx-auto">
                 <button onClick={() => router.back()} className="flex items-center gap-2 text-blue-500 hover:underline mb-4">
                    <ArrowLeft size={18} />
                    Voltar
                </button>

                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {livro && (
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h1 className="text-2xl font-bold">{livro.titulo}</h1>
                        <p className="text-gray-600 mb-6">Gerenciamento de Exemplares</p>

                        {/* Formulário para Adicionar Exemplar */}
                        <form onSubmit={handleAddExemplar} className="flex gap-2 mb-8">
                            <input
                                type="text"
                                value={newCodigoBarras}
                                onChange={(e) => setNewCodigoBarras(e.target.value)}
                                placeholder="Novo código de barras"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline flex-grow"
                            />
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center gap-2">
                                <PlusCircle size={18} />
                                Adicionar
                            </button>
                        </form>

                        {/* Lista de Exemplares */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold border-b pb-2">Exemplares Cadastrados ({exemplares.length})</h2>
                            {exemplares.length > 0 ? (
                                exemplares.map(ex => (
                                    <div key={ex.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50">
                                        <span className="font-mono">{ex.codigo_barras}</span>
                                        <button onClick={() => handleDeleteExemplar(ex.id)} className="text-red-500 hover:text-red-700" title="Excluir Exemplar">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">Nenhum exemplar cadastrado para este livro.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
};

export default GerenciarExemplaresPage;
