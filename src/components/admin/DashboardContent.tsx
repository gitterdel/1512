import React from 'react';
import { 
  Users, Building, Shield, Star, 
  TrendingUp, AlertTriangle, CheckCircle, Clock 
} from 'lucide-react';
import { User, Property } from '../../types';
import { format } from 'date-fns';

interface DashboardContentProps {
  users: User[];
  properties: Property[];
}

export const DashboardContent: React.FC<DashboardContentProps> = ({
  users,
  properties
}) => {
  // Calculate stats
  const stats = {
    totalUsers: users.length,
    totalTenants: users.filter(u => u.role === 'tenant').length,
    totalLandlords: users.filter(u => u.role === 'landlord').length,
    verifiedUsers: users.filter(u => u.verified).length,
    totalProperties: properties.length,
    verifiedProperties: properties.filter(p => p.verified).length,
    pendingProperties: properties.filter(p => !p.verified).length,
    featuredProperties: properties.filter(p => p.featured).length
  };

  // Get recent users
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Get recent properties
  const recentProperties = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">{stats.totalUsers}</p>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 mr-1" />
            <span>{stats.verifiedUsers} verificados</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Propiedades</p>
              <p className="mt-1 text-3xl font-semibold text-purple-600">{stats.totalProperties}</p>
            </div>
            <Building className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Star className="h-4 w-4 mr-1" />
            <span>{stats.featuredProperties} destacadas</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inquilinos</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{stats.totalTenants}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>Activos este mes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propietarios</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalLandlords}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <Shield className="h-4 w-4 mr-1" />
            <span>Verificados</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Usuarios Recientes</h2>
          </div>
          <div className="divide-y">
            {recentUsers.map(user => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    user.role === 'tenant' ? 'bg-green-100' :
                    user.role === 'landlord' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}>
                    <Users className={`h-5 w-5 ${
                      user.role === 'tenant' ? 'text-green-600' :
                      user.role === 'landlord' ? 'text-blue-600' : 'text-purple-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">
                    {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                  </span>
                  <div className="flex items-center mt-1">
                    {user.verified ? (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </span>
                    ) : (
                      <span className="text-xs text-yellow-600 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Propiedades Recientes</h2>
          </div>
          <div className="divide-y">
            {recentProperties.map(property => (
              <div key={property.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-gray-500">{property.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {format(new Date(property.createdAt), 'dd/MM/yyyy')}
                    </span>
                    <div className="flex items-center mt-1">
                      {property.verified ? (
                        <span className="text-xs text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificada
                        </span>
                      ) : (
                        <span className="text-xs text-yellow-600 flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};