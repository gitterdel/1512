import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Home, Plus, DollarSign, Users, Building, 
  MessageSquare, Star
} from 'lucide-react';
import { PropertyList } from '../components/PropertyList';
import { usePropertyStore } from '../store/usePropertyStore';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/format';
import { ChatPreview } from '../components/chat/ChatPreview';
import { useChatStore } from '../store/useChatStore';

export const LandlordDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();
  const { chats, messages } = useChatStore();
  
  if (!user) return null;

  // Filtrar propiedades del propietario actual
  const myProperties = properties.filter(p => p.landlordId === user.id);
  
  // Calcular estadísticas
  const totalIncome = myProperties.reduce((acc, prop) => acc + prop.price, 0);
  const availableCount = myProperties.filter(p => p.status === 'available').length;
  const rentedCount = myProperties.filter(p => p.status === 'rented').length;

  // Obtener chats relacionados con las propiedades del propietario
  const propertyChats = chats.filter(chat => 
    chat.propertyId && myProperties.some(p => p.id === chat.propertyId)
  );

  // Obtener mensajes no leídos
  const unreadMessages = propertyChats.reduce((acc, chat) => {
    const chatMessages = messages[chat.id] || [];
    return acc + chatMessages.filter(msg => !msg.read && msg.receiverId === user.id).length;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Quick Actions Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => navigate('/landlord/properties/add')}
            variant="primary"
            icon={<Plus className="h-5 w-5" />}
          >
            Nueva Propiedad
          </Button>
          <Button
            onClick={() => navigate('/messages')}
            variant="outline"
            icon={<MessageSquare className="h-5 w-5" />}
          >
            Mensajes {unreadMessages > 0 && <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-0.5 text-xs">{unreadMessages}</span>}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p className="mt-1 text-3xl font-semibold text-indigo-600">{formatPrice(totalIncome)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Total de propiedades alquiladas</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Propiedades</p>
              <p className="mt-1 text-3xl font-semibold text-blue-600">{myProperties.length}</p>
            </div>
            <Building className="h-8 w-8 text-blue-600" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Total de propiedades</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inquilinos</p>
              <p className="mt-1 text-3xl font-semibold text-green-600">{rentedCount}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Inquilinos activos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valoración Media</p>
              <p className="mt-1 text-3xl font-semibold text-yellow-600">4.8</p>
            </div>
            <Star className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="mt-1 text-sm text-gray-500">Basado en {myProperties.length} propiedades</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Mis Propiedades</h2>
              </div>
            </div>

            <PropertyList properties={myProperties} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Messages Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <MessageSquare className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-bold">Mensajes</h2>
                </div>
                {unreadMessages > 0 && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {unreadMessages} nuevos
                  </span>
                )}
              </div>
            </div>
            
            <ChatPreview chats={propertyChats.slice(0, 5)} />

            <div className="p-4 border-t">
              <Button
                onClick={() => navigate('/messages')}
                variant="outline"
                className="w-full"
              >
                Ver todos los mensajes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};