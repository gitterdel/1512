import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Search, MessageSquare, Bookmark, 
  Star, Building, DollarSign, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { useChatStore } from '../store/useChatStore';
import { useSavedPropertiesStore } from '../store/useSavedPropertiesStore';
import { Button } from '../components/ui/Button';
import { PropertyCard } from '../components/PropertyCard';
import { AvatarUpload } from '../components/ui/AvatarUpload';
import { formatPrice } from '../utils/format';

export const TenantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();
  const { chats, messages } = useChatStore();
  const { getSavedProperties } = useSavedPropertiesStore();

  if (!user) return null;

  // Get saved properties
  const savedPropertyIds = getSavedProperties(user.id);
  const savedProperties = properties.filter(p => savedPropertyIds.includes(p.id));

  // Get user's chats
  const userChats = chats.filter(chat => chat.participants.includes(user.id));
  const unreadMessages = userChats.reduce((acc, chat) => {
    const chatMessages = messages[chat.id] || [];
    return acc + chatMessages.filter(msg => !msg.read && msg.receiverId === user.id).length;
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Overview */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <AvatarUpload
                size="xl"
                className="ring-4 ring-white/20"
              />
              <div className="text-white">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <p className="text-indigo-100 mt-1">{user.email}</p>
                {user.location && (
                  <p className="text-indigo-100 mt-1">
                    <Building className="inline-block h-4 w-4 mr-1" />
                    {user.location}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => navigate('/profile')}
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              Editar Perfil
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => navigate('/search')}
            variant="primary"
            className="h-auto py-6 flex-col items-center justify-center space-y-2"
          >
            <Search className="h-8 w-8" />
            <span className="text-lg">Buscar Propiedades</span>
          </Button>

          <Button
            onClick={() => navigate('/messages')}
            variant="outline"
            className="h-auto py-6 flex-col items-center justify-center space-y-2 relative"
          >
            <MessageSquare className="h-8 w-8" />
            <span className="text-lg">Mensajes</span>
            {unreadMessages > 0 && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                {unreadMessages}
              </span>
            )}
          </Button>

          <Button
            onClick={() => navigate('/tenant/saved')}
            variant="outline"
            className="h-auto py-6 flex-col items-center justify-center space-y-2"
          >
            <Bookmark className="h-8 w-8" />
            <span className="text-lg">Guardados</span>
          </Button>

          <Button
            onClick={() => navigate('/search')}
            variant="outline"
            className="h-auto py-6 flex-col items-center justify-center space-y-2"
          >
            <Building className="h-8 w-8" />
            <span className="text-lg">Explorar</span>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propiedades Guardadas</p>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{savedProperties.length}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-lg">
                <Bookmark className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Mensajes Pendientes</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">{unreadMessages}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valoración</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">4.8</p>
              </div>
              <div className="bg-yellow-100 p-4 rounded-lg">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Saved Properties */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Propiedades Guardadas</h2>
              <Button
                onClick={() => navigate('/tenant/saved')}
                variant="outline"
                size="sm"
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Ver todas
              </Button>
            </div>
          </div>

          <div className="p-6">
            {savedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedProperties.slice(0, 4).map(property => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes propiedades guardadas
                </h3>
                <p className="text-gray-500 mb-6">
                  Guarda las propiedades que te interesen para acceder a ellas fácilmente
                </p>
                <Button
                  onClick={() => navigate('/search')}
                  variant="outline"
                >
                  Explorar propiedades
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};