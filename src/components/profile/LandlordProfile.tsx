import React from 'react';
import { User } from '../../types';
import { 
  Shield, MapPin, Calendar, Building, Star, 
  Home, DollarSign, CheckCircle, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { usePropertyStore } from '../../store/usePropertyStore';
import { PropertyCard } from '../PropertyCard';
import { formatPrice } from '../../utils/format';

interface LandlordProfileProps {
  user: User;
}

export const LandlordProfile: React.FC<LandlordProfileProps> = ({ user }) => {
  const { properties } = usePropertyStore();
  const userProperties = properties.filter(p => p.landlordId === user.id);
  
  const stats = {
    totalProperties: userProperties.length,
    activeRentals: userProperties.filter(p => p.status === 'rented').length,
    totalIncome: userProperties.reduce((acc, p) => p.status === 'rented' ? acc + p.price : acc, 0),
    averageRating: userProperties.reduce((acc, p) => acc + (p.rating || 0), 0) / userProperties.length || 0
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">{stats.totalProperties}</p>
            </div>
            <Building className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alquileres Activos</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.activeRentals}</p>
            </div>
            <Home className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{formatPrice(stats.totalIncome)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valoración Media</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">
                {stats.averageRating.toFixed(1)}
              </p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Properties Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Mis Propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Estado de Verificación</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Identidad</span>
                {user.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Shield className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Propiedades</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Documentación</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Información de Contacto</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{user.location || 'No especificada'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Miembro desde {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="h-5 w-5 mr-2" />
                <span>{stats.activeRentals} inquilinos activos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};