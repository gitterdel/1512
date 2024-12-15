import React from 'react';
import { Shield, MapPin, Calendar, Star, CheckCircle, Home, Building } from 'lucide-react';
import { format } from 'date-fns';
import { User } from '../../types';
import { Avatar } from '../ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface FeaturedTenantCardProps {
  tenant: User;
}

export const FeaturedTenantCard: React.FC<FeaturedTenantCardProps> = ({ tenant }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleClick = () => {
    if (!tenant) return;
    
    if (user?.id === tenant.id || user?.role === 'admin') {
      // Full access for own profile or admin
      navigate(`/profile/${tenant.id}`);
    } else {
      // Limited view for other users
      navigate(`/profile/${tenant.id}`, { 
        state: { limitedView: true }
      });
    }
  };

  if (!tenant) return null;

  const memberSince = format(new Date(tenant.createdAt), 'MMM yyyy');
  const hasReferences = tenant.tenantInfo?.references && Object.keys(tenant.tenantInfo.references).length > 0;

  return (
    <div 
      onClick={handleClick}
      className="group bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Header with gradient and featured badge */}
      <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-purple-600 p-4">
        <div className="absolute top-4 right-4">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-xs font-medium text-white">Destacado</span>
          </div>
        </div>
        <div className="absolute -bottom-10 left-4">
          <Avatar
            src={tenant.avatar}
            name={tenant.name}
            size="xl"
            className="ring-4 ring-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="pt-12 p-4">
        {/* Basic Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{tenant.name}</h3>
              {tenant.verified && (
                <Shield className="h-4 w-4 text-green-500" title="Verificado" />
              )}
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{tenant.location || 'Andorra'}</span>
            </div>
          </div>
        </div>

        {/* Public Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Building className="h-4 w-4 text-indigo-600 mr-1" />
                <span className="text-sm text-gray-600">Experiencia</span>
              </div>
              <span className="font-semibold text-indigo-600">{memberSince}</span>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-sm text-gray-600">Referencias</span>
              </div>
              <span className="font-semibold text-yellow-500">
                {hasReferences ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Verifications and Status */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Miembro desde {memberSince}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <Home className="h-4 w-4 mr-1" />
              <span>Búsqueda activa</span>
            </div>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verificado
            </span>
          </div>
        </div>

        {/* Verification Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {tenant.verified && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              <Shield className="h-3 w-3 mr-1" />
              ID Verificado
            </span>
          )}
          {hasReferences && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
              <Building className="h-3 w-3 mr-1" />
              Referencias
            </span>
          )}
        </div>
      </div>
    </div>
  );
};