import React, { useState, useEffect } from 'react';
import { Users, Building, Search, Star, Home, User } from 'lucide-react';
import { UserList } from '../components/admin/UserList';
import { PropertyManagement } from '../components/admin/PropertyManagement';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { toast } from 'react-hot-toast';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const AdminPanel = () => {
  const { registeredUsers, toggleUserStatus, deleteUser, verifyUser, fetchUsers } = useAuthStore();
  const { properties, updateProperty, deleteProperty, toggleFeatured } = usePropertyStore();
  const [activeTab, setActiveTab] = useState<'tenants' | 'landlords' | 'properties'>('tenants');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const loadUsers = async () => {
      try {
        await fetchUsers();
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Error al cargar los usuarios');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [fetchUsers]);

  const handleUserAction = async (action: string, userId: string) => {
    try {
      switch (action) {
        case 'verify':
          await verifyUser(userId);
          toast.success('Usuario verificado correctamente');
          break;
        case 'suspend':
          await toggleUserStatus(userId);
          break;
        case 'delete':
          if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
            await deleteUser(userId);
          }
          break;
      }
    } catch (error) {
      console.error('Error en acción de usuario:', error);
      toast.error('Error al procesar la acción');
    }
  };

  const handlePropertyAction = async (action: string, propertyId: string, updates?: any) => {
    try {
      switch (action) {
        case 'verify':
          await updateProperty(propertyId, updates);
          toast.success(updates.verified ? 
            'Propiedad verificada correctamente' : 
            'Verificación removida. La propiedad está pendiente de verificación'
          );
          break;
        case 'feature':
          await toggleFeatured(propertyId);
          break;
        case 'delete':
          if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
            await deleteProperty(propertyId);
          }
          break;
      }
    } catch (error) {
      console.error('Error en acción de propiedad:', error);
      toast.error('Error al procesar la acción');
    }
  };

  // Filtrar usuarios según el rol activo y término de búsqueda
  const filteredUsers = Object.values(registeredUsers).filter(user => {
    const matchesRole = 
      (activeTab === 'tenants' && user.role === 'tenant') ||
      (activeTab === 'landlords' && user.role === 'landlord');
    
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  const tenantsCount = Object.values(registeredUsers).filter(u => u.role === 'tenant').length;
  const landlordsCount = Object.values(registeredUsers).filter(u => u.role === 'landlord').length;
  const propertiesCount = properties.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="mt-1 text-gray-500">Gestiona usuarios, propiedades y contenido de la plataforma</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('tenants')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeTab === 'tenants'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <User className="h-5 w-5 mr-2" />
                Inquilinos ({tenantsCount})
              </button>

              <button
                onClick={() => setActiveTab('landlords')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeTab === 'landlords'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5 mr-2" />
                Propietarios ({landlordsCount})
              </button>

              <button
                onClick={() => setActiveTab('properties')}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  activeTab === 'properties'
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building className="h-5 w-5 mr-2" />
                Propiedades ({propertiesCount})
              </button>
            </div>

            <div className="w-64">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-5 w-5 text-gray-400" />}
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          {(activeTab === 'tenants' || activeTab === 'landlords') && (
            <UserList
              users={filteredUsers}
              onUserAction={handleUserAction}
              searchTerm={searchTerm}
            />
          )}
          {activeTab === 'properties' && (
            <PropertyManagement
              properties={properties}
              onPropertyAction={handlePropertyAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};