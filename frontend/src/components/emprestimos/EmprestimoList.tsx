// src/components/emprestimos/EmprestimoList.tsx
"use client";

import { format } from 'date-fns';

interface Emprestimo {
  id: number;
  exemplar: {
    livro: {
      titulo: string;
    };
  };
  data_emprestimo: string;
  data_devolucao: string | null;
  status: string;
}

interface EmprestimoListProps {
  emprestimos: Emprestimo[];
}

const EmprestimoList = ({ emprestimos }: EmprestimoListProps) => {
  if (emprestimos.length === 0) {
    return <p>Nenhum empréstimo encontrado.</p>;
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ATIVO':
        return 'bg-yellow-200 text-yellow-800';
      case 'ATRASADO':
        return 'bg-red-200 text-red-800';
      case 'CONCLUIDO':
        return 'bg-green-200 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Livro</th>
            <th className="py-3 px-4 text-left">Data do Empréstimo</th>
            <th className="py-3 px-4 text-left">Data da Devolução</th>
            <th className="py-3 px-4 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {emprestimos.map((emprestimo) => (
            <tr key={emprestimo.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-4">{emprestimo.exemplar.livro.titulo}</td>
              <td className="py-3 px-4">{format(new Date(emprestimo.data_emprestimo), 'dd/MM/yyyy')}</td>
              <td className="py-3 px-4">
                {emprestimo.data_devolucao ? format(new Date(emprestimo.data_devolucao), 'dd/MM/yyyy') : '---'}
              </td>
              <td className="py-3 px-4 text-center">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusClass(emprestimo.status)}`}>
                  {emprestimo.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmprestimoList;
