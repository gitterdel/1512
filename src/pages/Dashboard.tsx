import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { PropertyList } from '../components/PropertyList';
import { Stats } from '../components/Stats';
import { Calendar, Home, MessageSquare, Settings } from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const isLandlord = user?.role === 'landlord';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold mb-6">Panel de Control</h2>
            <nav className="space-y-4">
              <a href="#properties" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                <Home className="h-5 w-5" />
                <span>{isLandlord ? 'Mis Propiedades' : 'Mis Alquileres'}</span>
              </a>
              <a href="#messages" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                <MessageSquare className="h-5 w-5" />
                <span>Mensajes</span>
              </a>
              <a href="#calendar" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                <Calendar className="h-5 w-5" />
                <span>Calendario</span>
              </a>
              <a href="#settings" className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600">
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </a>
            </nav>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            <Stats />
            <PropertyList />
          </div>
        </div>
      </div>
    </div>
  );
};