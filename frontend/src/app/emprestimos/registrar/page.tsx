"use client";

import { useState } from 'react';
import AuthGuard from '../../../components/auth/AuthGuard';
import { createEmprestimo, devolverEmprestimo } from '../../../lib/emprestimoService';
import { BookUp, BookDown } from 'lucide-react';
import { type AxiosError, isAxiosError } from 'axios'; // Import AxiosError and isAxiosError

const RegistrarEmprestimoDevolucaoPage = () => {
    const [loanData, setLoanData] = useState({ aluno_cpf: '', aluno_senha: '', exemplar_codigo: '' });
    const [returnData, setReturnData] = useState({ codigo_barras: '' });

    const [loadingLoan, setLoadingLoan] = useState(false);
    const [loadingReturn, setLoadingReturn] = useState(false);

    const [messageLoan, setMessageLoan] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [messageReturn, setMessageReturn] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    
    const handleLoanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoanData({ ...loanData, [e.target.name]: e.target.value });
    };

    const handleReturnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReturnData({ ...returnData, [e.target.name]: e.target.value });
    };

    const handleLoanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingLoan(true);
        setMessageLoan(null);
        try {
            await createEmprestimo(loanData);
            setMessageLoan({ text: 'Empréstimo registrado com sucesso!', type: 'success' });
            setLoanData({ aluno_cpf: '', aluno_senha: '', exemplar_codigo: '' }); // Limpa o formulário
        } catch (error: unknown) { // Catch as unknown
            let errorMsg = 'Não foi possível registrar o empréstimo.';
            if (isAxiosError(error) && error.response) {
                errorMsg = error.response.data?.detail || errorMsg;
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            setMessageLoan({ text: errorMsg, type: 'error' });
        } finally {
            setLoadingLoan(false);
        }
    };

    const handleReturnSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingReturn(true);
        setMessageReturn(null);
        try {
            await devolverEmprestimo(returnData);
            setMessageReturn({ text: 'Devolução registrada com sucesso!', type: 'success' });
            setReturnData({ codigo_barras: '' }); // Limpa o formulário
        } catch (error: unknown) { // Catch as unknown
            let errorMsg = 'Não foi possível registrar a devolução.';
            if (isAxiosError(error) && error.response) {
                errorMsg = error.response.data?.detail || errorMsg;
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            setMessageReturn({ text: errorMsg, type: 'error' });
        } finally {
            setLoadingReturn(false);
        }
    };

    return (
        <AuthGuard allowedRoles={['bibliotecario']}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Formulário de Empréstimo */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <BookUp size={28} className="text-blue-500" />
                        <h1 className="text-2xl font-bold">Registrar Empréstimo</h1>
                    </div>

                    {messageLoan && (
                        <div className={`p-3 mb-4 rounded text-sm ${messageLoan.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {messageLoan.text}
                        </div>
                    )}
                    <form onSubmit={handleLoanSubmit} className="space-y-4">
                        <div>
                            <label className="label" htmlFor="exemplar_codigo">Código do Exemplar</label>
                            <input required name="exemplar_codigo" id="exemplar_codigo" type="text" value={loanData.exemplar_codigo} onChange={handleLoanChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label className="label" htmlFor="aluno_cpf">CPF do Aluno</label>
                            <input required name="aluno_cpf" id="aluno_cpf" type="text" value={loanData.aluno_cpf} onChange={handleLoanChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <div>
                            <label className="label" htmlFor="aluno_senha">Senha do Aluno</label>
                            <input required name="aluno_senha" id="aluno_senha" type="password" value={loanData.aluno_senha} onChange={handleLoanChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <button type="submit" disabled={loadingLoan} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                            {loadingLoan ? 'Registrando...' : 'Registrar Empréstimo'}
                        </button>
                    </form>
                </div>

                {/* Formulário de Devolução */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                     <div className="flex items-center gap-3 mb-6">
                        <BookDown size={28} className="text-green-500" />
                        <h1 className="text-2xl font-bold">Registrar Devolução</h1>
                    </div>
                    {messageReturn && (
                         <div className={`p-3 mb-4 rounded text-sm ${messageReturn.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {messageReturn.text}
                        </div>
                    )}
                    <form onSubmit={handleReturnSubmit} className="space-y-4">
                        <div>
                            <label className="label" htmlFor="codigo_barras">Código do Exemplar</label>
                            <input required name="codigo_barras" id="codigo_barras" type="text" value={returnData.codigo_barras} onChange={handleReturnChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                        </div>
                        <button type="submit" disabled={loadingReturn} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full">
                            {loadingReturn ? 'Registrando...' : 'Registrar Devolução'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthGuard>
    );
};

export default RegistrarEmprestimoDevolucaoPage;