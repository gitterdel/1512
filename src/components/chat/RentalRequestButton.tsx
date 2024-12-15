import React from 'react';
import { HandshakeIcon } from 'lucide-react';

interface RentalRequestButtonProps {
  onRequest: () => void;
  isRequested: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export const RentalRequestButton: React.FC<RentalRequestButtonProps> = ({
  onRequest,
  isRequested,
  status
}) => {
  const getButtonStyle = () => {
    if (status === 'approved') {
      return 'bg-green-600 hover:bg-green-700';
    }
    if (status === 'rejected') {
      return 'bg-red-600 hover:bg-red-700';
    }
    if (isRequested) {
      return 'bg-yellow-600 hover:bg-yellow-700';
    }
    return 'bg-indigo-600 hover:bg-indigo-700';
  };

  const getButtonText = () => {
    if (status === 'approved') return 'Solicitud Aprobada';
    if (status === 'rejected') return 'Solicitud Rechazada';
    if (isRequested) return 'Solicitud Pendiente';
    return 'Solicitar Alquiler';
  };

  return (
    <button
      onClick={onRequest}
      disabled={isRequested || status !== undefined}
      className={`w-full ${getButtonStyle()} text-white py-3 px-4 rounded-md flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <HandshakeIcon className="h-5 w-5" />
      <span>{getButtonText()}</span>
    </button>
  );
};