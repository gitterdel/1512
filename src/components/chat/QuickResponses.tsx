import React from 'react';
import { X } from 'lucide-react';

interface QuickResponsesProps {
  onSelect: (response: string) => void;
  onClose: () => void;
  isLandlord: boolean;
}

export const QuickResponses: React.FC<QuickResponsesProps> = ({
  onSelect,
  onClose,
  isLandlord
}) => {
  const responses = isLandlord ? [
    '¡Hola! Gracias por tu interés en la propiedad.',
    'La propiedad sigue disponible. ¿Te gustaría concertar una visita?',
    'El precio incluye todos los gastos (agua, luz, internet).',
    'Necesitaría los siguientes documentos: DNI, nóminas de los últimos 3 meses y contrato laboral.',
    'El depósito es equivalente a 2 meses de alquiler.',
    'La duración mínima del contrato es de 12 meses.',
    'Podemos organizar una videollamada para mostrarte la propiedad.',
  ] : [
    '¡Hola! Me interesa tu propiedad.',
    '¿Podríamos concertar una visita?',
    '¿El precio incluye los gastos?',
    '¿Qué documentación necesitaría para alquilar?',
    '¿Cuál es el depósito requerido?',
    '¿Cuál es la duración mínima del contrato?',
    '¿Sería posible hacer una videollamada para ver la propiedad?',
  ];

  return (
    <div className="bg-white border-t p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">Respuestas Rápidas</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {responses.map((response, index) => (
          <button
            key={index}
            onClick={() => onSelect(response)}
            className="text-left p-2 hover:bg-gray-50 rounded-lg text-sm text-gray-700 transition-colors"
          >
            {response}
          </button>
        ))}
      </div>
    </div>
  );
};