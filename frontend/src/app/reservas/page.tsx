"use client";

import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useAuth } from '../../context/AuthContext';
import { getMinhasReservas, cancelReserva, Reserva } from '../../lib/reservaService';
import AuthGuard from '../../components/auth/AuthGuard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { isAxiosError } from 'axios'; // Import isAxiosError

const MinhasReservasPage = () => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReservas = useCallback(async () => { // Wrap in useCallback
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getMinhasReservas(user.id);
            setReservas(data);
        } catch (err: unknown) { // Catch as unknown
            let errorMsg = 'Não foi possível carregar suas reservas.';
            if (isAxiosError(err) && err.response) {
                errorMsg = err.response.data?.detail || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [user]); // Add user to useCallback dependencies

    useEffect(() => {
        fetchReservas();
    }, [fetchReservas]); // Add fetchReservas to useEffect dependencies

    const handleCancelReserva = async (reservaId: number) => {
        if (window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
            try {
                await cancelReserva(reservaId);
                // Atualiza a lista de reservas localmente
                setReservas(prev => prev.filter(r => r.id !== reservaId));
                alert('Reserva cancelada com sucesso.');
            } catch (err: unknown) { // Catch as unknown
                let errorMsg = 'Não foi possível cancelar a reserva.';
                 if (isAxiosError(err) && err.response) {
                    errorMsg = err.response.data?.detail || errorMsg;
                } else if (err instanceof Error) {
                    errorMsg = err.message;
                }
                alert(errorMsg);
            }
        }
    };

    return (
        <AuthGuard allowedRoles={['aluno']}>
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Minhas Reservas</h1>
                
                {loading && <p>Carregando...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && (
                    reservas.length > 0 ? (
                        <div className="space-y-4">
                            {reservas.map(reserva => (
                                <div key={reserva.id} className="border rounded-lg p-4 flex flex-col md:flex-row justify-between items-center">
                                    <div>
                                        <h2 className="font-bold text-lg">{reserva.livro.titulo}</h2>
                                        <p className="text-sm text-gray-600">Autor: {reserva.livro.autor}</p>
                                        <p className="text-sm text-gray-500">
                                            Reservado em: {format(new Date(reserva.data_reserva), 'PPP', { locale: ptBR })}
                                        </p>
                                        <p className="text-sm font-semibold text-red-600">
                                            Válido até: {format(new Date(reserva.data_validade), 'PPP', { locale: ptBR })}
                                        </p>
                                    </div>
                                    <div className="mt-4 md:mt-0">
                                        <button 
                                            onClick={() => handleCancelReserva(reserva.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Cancelar Reserva
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500">Você não possui nenhuma reserva ativa no momento.</p>
                            <Link href="/livros" className="mt-4 inline-block btn-primary">
                                Ver Catálogo de Livros
                            </Link>
                        </div>
                    )
                )}
            </div>
        </AuthGuard>
    );
};

export default MinhasReservasPage;