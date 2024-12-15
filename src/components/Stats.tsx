import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { DollarSign, Users, Home, Star } from 'lucide-react';

export const Stats = () => {
  const { user } = useAuthStore();
  const isLandlord = user?.role === 'landlord';

  const stats = isLandlord
    ? [
        { label: 'Ingresos Mensuales', value: '$2,500', icon: DollarSign },
        { label: 'Propiedades Activas', value: '4', icon: Home },
        { label: 'Inquilinos Totales', value: '6', icon: Users },
        { label: 'Calificación Media', value: '4.8', icon: Star },
      ]
    : [
        { label: 'Renta Mensual', value: '$800', icon: DollarSign },
        { label: 'Días Restantes', value: '25', icon: Calendar },
        { label: 'Solicitudes Activas', value: '2', icon: Home },
        { label: 'Mi Calificación', value: '4.9', icon: Star },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold mt-1">{stat.value}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <stat.icon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};