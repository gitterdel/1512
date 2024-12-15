import React from 'react';
import { X, Shield, MapPin, Calendar, User } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface QuickProfileViewProps {
  userId: string;
  onClose: () => void;
  onViewFullProfile?: () => void;
}

export const QuickProfileView: React.FC<QuickProfileViewProps> = ({
  userId,
  onClose,
  onViewFullProfile
}) => {
  const { registeredUsers } = useAuthStore();
  const user = registeredUsers[userId];

  if (!user) return null;

  return (
    <div className="absolute right-0 top-0 w-80 bg-white rounded-lg shadow-xl border p-4 z-50">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Perfil de Usuario</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center space-x-3 mb-4">
        <Avatar
          src={user.avatar}
          name={user.name}
          size="lg"
        />
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-medium">{user.name}</h4>
            {user.verified && (
              <Shield className="h-4 w-4 text-green-500" title="Verificado" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {user.role === 'tenant' ? 'Inquilino' : 'Propietario'}
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {user.location && (
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{user.location}</span>
          </div>
        )}
        <div className="flex items-center text-gray-600 text-sm">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Miembro desde {format(new Date(user.createdAt), 'MMM yyyy')}</span>
        </div>
      </div>

      {onViewFullProfile && (
        <Button
          onClick={onViewFullProfile}
          variant="primary"
          className="w-full"
        >
          Ver Perfil Completo
        </Button>
      )}
    </div>
  );
};