import React from 'react';
import { User } from '../../types';
import { Shield, Star, UserX, ExternalLink, Check, Clock, Building } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useFeaturedTenantsStore } from '../../store/useFeaturedTenantsStore';
import { toast } from 'react-hot-toast';

interface UserListProps {
  users: User[];
  onUserAction: (action: string, userId: string) => void;
  searchTerm: string;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onUserAction,
  searchTerm
}) => {
  const navigate = useNavigate();
  const { isFeatured, addFeaturedTenant, removeFeaturedTenant } = useFeaturedTenantsStore();

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`, { state: { fromAdmin: true } });
  };

  const handleToggleFeatured = (userId: string) => {
    if (isFeatured(userId)) {
      removeFeaturedTenant(userId);
      toast.success('Inquilino removido de destacados');
    } else {
      addFeaturedTenant(userId);
      toast.success('Inquilino marcado como destacado');
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                {user.verified && (
                  <Shield className="h-4 w-4 text-green-500" />
                )}
                {user.role === 'tenant' && isFeatured(user.id) && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
              
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'tenant' 
                    ? 'bg-blue-100 text-blue-800'
                    : user.role === 'landlord'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role === 'tenant' ? 'Inquilino' : 
                   user.role === 'landlord' ? 'Propietario' : 
                   'Administrador'}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'Activo' : 'Suspendido'}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Clock className="h-3 w-3 mr-1" />
                  {format(new Date(user.createdAt), 'MMM yyyy')}
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewProfile(user.id)}
                icon={<ExternalLink className="h-4 w-4" />}
              >
                Ver perfil
              </Button>

              {user.role === 'tenant' && (
                <Button
                  variant={isFeatured(user.id) ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleToggleFeatured(user.id)}
                  icon={<Star className="h-4 w-4" />}
                >
                  {isFeatured(user.id) ? 'Destacado' : 'Destacar'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onUserAction('suspend', user.id)}
                icon={<UserX className="h-4 w-4" />}
                className="text-red-600 hover:bg-red-50"
              >
                {user.status === 'active' ? 'Suspender' : 'Activar'}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};