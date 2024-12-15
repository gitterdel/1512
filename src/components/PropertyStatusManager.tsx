import React from 'react';
import { usePropertyStore } from '../store/usePropertyStore';
import { Property } from '../types';
import { Button } from './ui/Button';

interface PropertyStatusManagerProps {
  properties: Property[];
}

export const PropertyStatusManager = ({ properties }: PropertyStatusManagerProps) => {
  const { updateProperty } = usePropertyStore();

  const handleStatusChange = (propertyId: string, status: 'available' | 'reserved' | 'rented') => {
    updateProperty(propertyId, { status });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Gestión de Estados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4">Propiedad</th>
              <th className="text-left py-3 px-4">Ubicación</th>
              <th className="text-left py-3 px-4">Estado Actual</th>
              <th className="text-left py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={property.images[0]} 
                      alt={property.title}
                      className="w-10 h-10 rounded object-cover"
                    />
                    <span className="font-medium">{property.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4">{property.location}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${property.status === 'available' ? 'bg-green-100 text-green-800' : 
                      property.status === 'reserved' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}
                  >
                    {property.status === 'available' ? 'Disponible' :
                     property.status === 'reserved' ? 'Reservada' : 'Alquilada'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select
                    value={property.status || 'available'}
                    onChange={(e) => handleStatusChange(property.id, e.target.value as any)}
                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="available">Disponible</option>
                    <option value="reserved">Reservada</option>
                    <option value="rented">Alquilada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};