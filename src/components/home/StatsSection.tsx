import React from 'react';
import { Home, Users, Clock, Shield } from 'lucide-react';

interface StatsSectionProps {
  totalProperties: number;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ totalProperties }) => {
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            La Plataforma Líder en Alquiler
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Miles de personas confían en nosotros para encontrar su hogar ideal en Andorra
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform duration-200">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-4xl font-bold text-indigo-600 mb-2">
              {totalProperties}+
            </div>
            <p className="text-gray-600 font-medium">Propiedades Disponibles</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform duration-200">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-4xl font-bold text-purple-600 mb-2">5000+</div>
            <p className="text-gray-600 font-medium">Usuarios Activos</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform duration-200">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">100%</div>
            <p className="text-gray-600 font-medium">Propiedades Verificadas</p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg text-center transform hover:scale-105 transition-transform duration-200">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <p className="text-gray-600 font-medium">Soporte Disponible</p>
          </div>
        </div>
      </div>
    </div>
  );
};