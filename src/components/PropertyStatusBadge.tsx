import React from 'react';

interface PropertyStatusBadgeProps {
  status: 'available' | 'reserved' | 'rented';
  verified?: boolean;
}

export const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({ status, verified }) => {
  const getStatusStyles = () => {
    if (!verified) {
      return 'bg-yellow-100 text-yellow-800';
    }

    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      case 'rented':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = () => {
    if (!verified) {
      return 'Pendiente de verificación';
    }

    switch (status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Reservada';
      case 'rented':
        return 'Alquilada';
      default:
        return 'Desconocido';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles()}`}>
      {getStatusText()}
    </span>
  );
};