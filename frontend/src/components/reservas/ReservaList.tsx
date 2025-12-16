// src/components/reservas/ReservaList.tsx
"use client";

import { format } from 'date-fns';

interface Reserva {
  id: number;
  livro: {
    titulo: string;
  };
  data_reserva: string;
  data_validade: string;
}

interface ReservaListProps {
  reservas: Reserva[];
  handleCancel: (id: number) => void;
}

const ReservaList = ({ reservas, handleCancel }: ReservaListProps) => {
  if (reservas.length === 0) {
    return <p>Nenhuma reserva encontrada.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-3 px-4 text-left">Livro</th>
            <th className="py-3 px-4 text-left">Data da Reserva</th>
            <th className="py-3 px-4 text-left">Data de Validade</th>
            <th className="py-3 px-4 text-center">Ação</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {reservas.map((reserva) => (
            <tr key={reserva.id} className="border-b border-gray-200 hover:bg-gray-100">
              <td className="py-3 px-4">{reserva.livro.titulo}</td>
              <td className="py-3 px-4">{format(new Date(reserva.data_reserva), 'dd/MM/yyyy')}</td>
              <td className="py-3 px-4">{format(new Date(reserva.data_validade), 'dd/MM/yyyy')}</td>
              <td className="py-3 px-4 text-center">
                <button onClick={() => handleCancel(reserva.id)} className="text-red-500 hover:underline">
                    Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReservaList;
