"use client";

import { useState, useEffect } from 'react';
import AuthGuard from "../../components/auth/AuthGuard";
import { useAuth } from "../../context/AuthContext";
import { getUsuario, updateUsuario, UserUpdateData } from '../../lib/userService';
import { isAxiosError } from 'axios';

const MinhaContaPage = () => {
    const { user, setUser } = useAuth(); // Get setUser from context to update it
    const [initialData, setInitialData] = useState<UserUpdateData>({ nome_completo: '', email: '' });
    const [formData, setFormData] = useState<UserUpdateData>({ nome_completo: '', email: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getUsuario(user.id)
                .then(data => {
                    const userData = {
                        nome_completo: data.nome_completo,
                        email: data.email,
                    };
                    setFormData(userData);
                    setInitialData(userData);
                })
                .catch(() => {
                    setError("Não foi possível carregar os dados atualizados.");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedUser = await updateUsuario(user.id, formData);
            // Atualiza o contexto e o localStorage para refletir a mudança em toda a UI
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setInitialData(formData);
            setSuccess("Perfil atualizado com sucesso!");
        } catch (err) {
            let errorMsg = "Não foi possível atualizar o perfil.";
            if (isAxiosError(err) && err.response) {
                errorMsg = err.response.data?.detail || errorMsg;
            } else if (err instanceof Error) {
                errorMsg = err.message;
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);

    return (
        <AuthGuard allowedRoles={['aluno', 'bibliotecario']}>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Minha Conta</h1>

                {loading && !user && <p>Carregando...</p>}
                
                {user && (
                     <div className="bg-white p-8 rounded-lg shadow-lg">
                        <div className="border-b pb-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Dados Fixos</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">CPF</label>
                                    <p className="mt-1 text-lg bg-gray-100 p-2 rounded">{user.cpf}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500">Matrícula</label>
                                    <p className="mt-1 text-lg bg-gray-100 p-2 rounded">{user.matricula}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h2 className="text-xl font-semibold mb-6">Dados Editáveis</h2>
                            
                            {error && <p className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</p>}
                            {success && <p className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</p>}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="nome_completo" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="nome_completo"
                                        id="nome_completo"
                                        value={formData.nome_completo}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>
                            <div className="mt-8 text-right">
                                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" disabled={!isChanged || loading}>
                                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthGuard>
    );
};

export default MinhaContaPage;
