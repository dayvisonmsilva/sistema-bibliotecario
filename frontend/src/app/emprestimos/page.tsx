"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getMeusEmprestimos, renovarEmprestimo, Emprestimo } from '../../lib/emprestimoService';
import AuthGuard from '../../components/auth/AuthGuard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { isAxiosError } from 'axios';

const MeusEmprestimosPage = () => {
    const { user } = useAuth();
    const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmprestimos = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMeusEmprestimos(user.id);
            setEmprestimos(data);
        } catch {
            setError('Não foi possível carregar seus empréstimos.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEmprestimos();
    }, [fetchEmprestimos]);

    const handleRenovar = async (emprestimoId: number) => {
        if (!window.confirm("Deseja realmente renovar este empréstimo por mais 7 dias?")) return;

        try {
            const emprestimoAtualizado = await renovarEmprestimo(emprestimoId);
            setEmprestimos(prev => 
                prev.map(emp => 
                    emp.id === emprestimoId ? emprestimoAtualizado : emp
                )
            );
            alert("Empréstimo renovado com sucesso!");
        } catch (error) {
            let errorMsg = "Não foi possível renovar o empréstimo.";
             if (isAxiosError(error) && error.response) {
                errorMsg = error.response.data?.detail || errorMsg;
            }
            alert(errorMsg);
        }
    };

    const { ativos, concluidos } = useMemo(() => {
        const ativos = emprestimos.filter(e => e.status === 'ATIVO' || e.status === 'ATRASADO');
        const concluidos = emprestimos.filter(e => e.status === 'CONCLUIDO');
        return { ativos, concluidos };
    }, [emprestimos]);

    const getStatusClass = (status: Emprestimo['status']) => {
        switch (status) {
            case 'ATIVO': return 'bg-blue-100 text-blue-800';
            case 'ATRASADO': return 'bg-yellow-100 text-yellow-800';
            case 'CONCLUIDO': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthGuard allowedRoles={['aluno']}>
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Empréstimos</h1>

                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!loading && !error && (
                    emprestimos.length === 0 ? (
                         <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">Você não possui nenhum empréstimo no seu histórico.</p>
                             <Link href="/livros" className="mt-4 inline-block btn-primary">
                                Ver Catálogo de Livros
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Empréstimos Ativos */}
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Ativos</h2>
                                {ativos.length > 0 ? (
                                    <div className="space-y-4">
                                        {ativos.map(emp => (
                                            <div key={emp.id} className="border rounded-lg p-4">
                                                <div className="flex flex-col md:flex-row justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{emp.exemplar.livro.titulo}</h3>
                                                        <p className="text-sm text-gray-600">Código do Exemplar: {emp.exemplar.codigo_barras}</p>
                                                        <p className="text-sm text-gray-500">Emprestado em: {format(new Date(emp.data_emprestimo), 'PPP', { locale: ptBR })}</p>
                                                        <p className="text-sm font-semibold text-red-600">Devolver até: {format(new Date(emp.data_limite), 'PPP', { locale: ptBR })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(emp.status)}`}>
                                                            {emp.status}
                                                        </span>
                                                        <button 
                                                            onClick={() => handleRenovar(emp.id)}
                                                            disabled={emp.status !== 'ATIVO'} 
                                                            className="btn-primary" 
                                                            title={emp.status !== 'ATIVO' ? "Apenas empréstimos ativos podem ser renovados." : "Renovar por mais 7 dias"}
                                                        >
                                                            Renovar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">Nenhum empréstimo ativo.</p>}
                            </section>

                            {/* Empréstimos Concluídos */}
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Histórico</h2>
                                 {concluidos.length > 0 ? (
                                    <div className="space-y-4">
                                        {concluidos.map(emp => (
                                            <div key={emp.id} className="border rounded-lg p-4 bg-gray-50 opacity-70">
                                                <h3 className="font-bold">{emp.exemplar.livro.titulo}</h3>
                                                <p className="text-sm text-gray-500">Devolvido em: {emp.data_devolucao ? format(new Date(emp.data_devolucao), 'PPP', { locale: ptBR }) : 'N/A'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-gray-500">Nenhum empréstimo no histórico.</p>}
                            </section>
                        </div>
                    )
                )}
            </div>
        </AuthGuard>
    );
};

export default MeusEmprestimosPage;