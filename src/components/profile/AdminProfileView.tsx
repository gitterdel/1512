import React from 'react';
import { User } from '../../types';
import { 
  Shield, Users, Building, CheckCircle,
  Calendar, Settings, AlertTriangle, Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { usePropertyStore } from '../../store/usePropertyStore';
import { useAuthStore } from '../../store/useAuthStore';

interface AdminProfileViewProps {
  user: User;
}

export const AdminProfileView: React.FC<AdminProfileViewProps> = ({ user }) => {
  const { properties } = usePropertyStore();
  const { registeredUsers } = useAuthStore();

  const stats = {
    totalUsers: Object.keys(registeredUsers).length,
    totalProperties: properties.length,
    pendingVerifications: properties.filter(p => !p.verified).length,
    activeUsers: Object.values(registeredUsers).filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalProperties}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">{stats.pendingVerifications}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.activeUsers}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Admin Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Información del Administrador</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <Shield className="h-5 w-5 mr-2" />
                  <span>Administrador Principal</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Miembro desde {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>Cuenta Verificada</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Shield className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium">Verificación de propiedad completada</p>
                  <p className="text-sm text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium">Usuario verificado</p>
                  <p className="text-sm text-gray-500">Hace 4 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="flex items-center">
                  <Shield className="h-5 w-5 text-indigo-600 mr-2" />
                  <span>Verificar Usuarios</span>
                </span>
                <span className="text-sm text-gray-500">{stats.pendingVerifications}</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="flex items-center">
                  <Settings className="h-5 w-5 text-gray-600 mr-2" />
                  <span>Configuración</span>
                </span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Estado del Sistema</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Base de datos</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Almacenamiento</span>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};