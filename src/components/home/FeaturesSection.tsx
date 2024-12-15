import React from 'react';
import { Shield, Users, Building } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verificación Completa',
    description: 'Todos los propietarios e inquilinos están verificados'
  },
  {
    icon: Users,
    title: 'Comunidad Activa',
    description: 'Más de 5,000 usuarios confían en nosotros'
  },
  {
    icon: Building,
    title: 'Amplia Selección',
    description: 'Más de 1,000 propiedades disponibles'
  }
];

export const FeaturesSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">¿Por qué elegirnos?</h2>
        <p className="mt-4 text-lg text-gray-600">
          Descubre las ventajas de buscar tu próximo hogar con nosotros
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};