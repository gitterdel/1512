import React from 'react';
import { 
  Shield, MapPin, Calendar, Briefcase, Star, 
  CheckCircle, Clock, Home, User, Building
} from 'lucide-react';
import { format } from 'date-fns';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';

interface FeaturedTenantProfileProps {
  tenant: User;
}

export const FeaturedTenantProfile: React.FC<FeaturedTenantProfileProps> = ({ tenant }) => {
  const stats = [
    {
      icon: Clock,
      label: 'Tiempo como inquilino',
      value: '2+ años'
    },
    {
      icon: Home,
      label: 'Alquileres completados',
      value: '3'
    },
    {
      icon: Star,
      label: 'Valoración media',
      value: '4.8'
    },
    {
      icon: CheckCircle,
      label: 'Referencias verificadas',
      value: '100%'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative -mt-16 px-6">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-5">
            <Avatar
              src={tenant.avatar}
              name={tenant.name}
              size="xl"
              className="w-32 h-32 ring-4 ring-white"
            />
            
            <div className="mt-6 md:mt-0 md:flex-1">
              <div className="flex items-center">
                <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>
                {tenant.verified && (
                  <Shield className="h-6 w-6 ml-2 text-green-500" />
                )}
              </div>
              
              <div className="mt-1 flex flex-wrap items-center text-sm text-gray-600 gap-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {tenant.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Miembro desde {format(new Date(tenant.createdAt), 'MMMM yyyy')}
                </div>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-1" />
                  Inquilino destacado
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="h-5 w-5 text-indigo-600" />
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Sobre mí</h2>
            <p className="text-gray-600">{tenant.bio}</p>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Preferencias de Alquiler</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Busca: Casa completa</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Zona: Centro ciudad</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Duración: Larga estancia</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Individual</span>
              </div>
            </div>
          </div>

          {/* References Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Referencias</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Último propietario</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Verificado</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">
                  "Excelente inquilino, siempre puntual con los pagos y muy cuidadoso con la propiedad."
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Empleador actual</span>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm">Verificado</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">
                  "Profesional responsable con contrato indefinido."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Verification Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Verificaciones</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Identidad</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Teléfono</span>
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

          {/* Employment Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Información Laboral</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-5 w-5 mr-2" />
                <span>Empleo estable</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Building className="h-5 w-5 mr-2" />
                <span>Sector tecnológico</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>3+ años en la empresa</span>
              </div>
            </div>
          </div>

          {/* Activity Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Estado</h2>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">Búsqueda activa</span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Última actividad: {format(new Date(tenant.lastLogin), 'dd/MM/yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};