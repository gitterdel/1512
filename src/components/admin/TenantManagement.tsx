import React from 'react';
import { User } from '../../types';
import { Shield, Star, UserX, ExternalLink, Check, Clock, Building } from 'lucide-react';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useFeaturedTenantsStore } from '../../store/useFeaturedTenantsStore';
import { toast } from 'react-hot-toast';

interface TenantManagementProps {
  users: User[];
  onUserAction: (action: string, userId: string) => void;
  searchTerm: string;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  users,
  onUserAction,
  searchTerm
}) => {
  const navigate = useNavigate();
  const { isFeatured, addFeaturedTenant, removeFeaturedTenant } = useFeaturedTenantsStore();

  // Filtrar usuarios por rol y término de búsqueda
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col items-center justify-center">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg mb-2">No se encontraron usuarios</p>
          <p className="text-gray-400">Prueba con otros términos de búsqueda</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredUsers.map((user) => (
        <div key={user.id} className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <Avatar
                src={user.avatar}
                name={user.name}
                size="lg"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-lg">{user.name}</h3>
                  {user.verified && (
                    <Shield className="h-4 w-4 text-green-500" />
                  )}
                  {user.role === 'tenant' && isFeatured(user.id) && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </div>
                <p className="text-gray-500">{user.email}</p>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'tenant' 
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {user.role === 'tenant' ? 'Inquilino' : 'Propietario'}
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
                    Miembro desde {format(new Date(user.createdAt), 'MMM yyyy')}
                  </span>
                  {user.location && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      <Building className="h-3 w-3 mr-1" />
                      {user.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
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
                onClick={() => handleViewProfile(user.id)}
                icon={<ExternalLink className="h-4 w-4" />}
              >
                Ver perfil
              </Button>

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