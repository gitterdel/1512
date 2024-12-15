import React from 'react';
import { User } from '../../types';
import { 
  Shield, MapPin, Calendar, Briefcase, Star, 
  CheckCircle, Clock, Home, Building, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface TenantProfileViewProps {
  user: User;
}

export const TenantProfileView: React.FC<TenantProfileViewProps> = ({ user }) => {
  const tenantInfo = user.tenantInfo || {
    employmentStatus: 'employed',
    workplace: 'No especificado',
    monthlyIncome: 0,
    residencyStatus: 'resident',
    hasPets: false,
    smoker: false,
    preferredMoveInDate: new Date()
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estado</p>
              <p className="mt-1 text-xl font-semibold text-green-600">Activo</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Búsqueda</p>
              <p className="mt-1 text-xl font-semibold text-blue-600">En proceso</p>
            </div>
            <Home className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Referencias</p>
              <p className="mt-1 text-xl font-semibold text-purple-600">Verificadas</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Verificación</p>
              <p className="mt-1 text-xl font-semibold text-indigo-600">Completa</p>
            </div>
            <Shield className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Información Laboral</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Briefcase className="h-5 w-5 mr-2" />
                  <span>
                    {tenantInfo.employmentStatus === 'employed' ? 'Empleado' :
                     tenantInfo.employmentStatus === 'self_employed' ? 'Autónomo' :
                     tenantInfo.employmentStatus === 'student' ? 'Estudiante' : 
                     'Buscando empleo'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Building className="h-5 w-5 mr-2" />
                  <span>{tenantInfo.workplace}</span>
                </div>
                {tenantInfo.monthlyIncome > 0 && (
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>{tenantInfo.monthlyIncome}€/mes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rental Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Preferencias de Alquiler</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Home className="h-5 w-5 mr-2" />
                  <span>Busca: Casa completa</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>Zona preferida: Centro</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>Disponibilidad inmediata</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Estado de Verificación</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Identidad</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Empleo</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Referencias</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Información Adicional</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{user.location || 'No especificada'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Miembro desde {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
              </div>
              {tenantInfo.preferredMoveInDate && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>
                    Mudanza preferida: {format(new Date(tenantInfo.preferredMoveInDate), 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};