import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useInterestStore } from '../store/useInterestStore';
import { Property } from '../types';

interface InterestRequestProps {
  property: Property;
  onRequestSent: () => void;
}

export const InterestRequest: React.FC<InterestRequestProps> = ({ property, onRequestSent }) => {
  const [message, setMessage] = useState('');
  const { user } = useAuthStore();
  const { addInterest } = useInterestStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    addInterest({
      tenantId: user.id,
      propertyId: property.id,
      landlordId: property.landlordId,
      message,
    });

    onRequestSent();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mensaje para el propietario
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Preséntate y explica por qué estás interesado en esta propiedad..."
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
      >
        Enviar Solicitud de Interés
      </button>

      <p className="text-sm text-gray-500 text-center">
        El propietario podrá ver tu perfil completo al recibir esta solicitud
      </p>
    </form>
  );
};