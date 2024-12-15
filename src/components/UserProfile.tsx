import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { Shield, MapPin, Calendar, Mail, Phone, Edit, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { format } from 'date-fns';

export const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, registeredUsers } = useAuthStore();
  const { chats } = useChatStore();
  const { fromChat, chatId } = location.state || {};

  const profileUser = id ? registeredUsers[id] : user;
  const isOwnProfile = user?.id === profileUser?.id;

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const handleBack = () => {
    if (fromChat && chatId) {
      navigate('/messages');
    } else {
      navigate(-1);
    }
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  // Verificar si hay una conversación activa entre los usuarios
  const hasActiveChat = chats.some(chat => 
    chat.participants.includes(user?.id || '') && 
    chat.participants.includes(profileUser?.id || '')
  );

  // Determinar si se puede ver el perfil completo
  const canViewProfile = isOwnProfile || fromChat || hasActiveChat || user?.role === 'admin';

  if (!canViewProfile) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil Privado</h2>
          <p className="text-gray-600 mb-6">
            Este perfil solo está disponible para usuarios que tienen una conversación activa.
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
            >
              Volver
            </Button>
            <Button
              onClick={() => navigate('/search')}
              variant="primary"
            >
              Explorar Propiedades
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          onClick={handleBack}
          variant="ghost"
          icon={<ArrowLeft className="h-5 w-5" />}
        >
          {fromChat ? 'Volver al chat' : 'Volver'}
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-end space-x-4">
              <Avatar
                src={profileUser.avatar}
                name={profileUser.name}
                size="xl"
                className="w-24 h-24 border-4 border-white"
              />
              <div className="flex-1 text-white pb-2">
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold">{profileUser.name}</h1>
                  {profileUser.verified && (
                    <Shield className="h-6 w-6" title="Verificado" />
                  )}
                </div>
                <p className="text-indigo-100">
                  {profileUser.role === 'tenant' ? 'Inquilino' : 
                   profileUser.role === 'landlord' ? 'Propietario' : 
                   'Administrador'}
                </p>
              </div>
              {isOwnProfile && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  icon={<Edit className="h-5 w-5" />}
                >
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
              {profileUser.bio && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Sobre mí</h2>
                  <p className="text-gray-600">{profileUser.bio}</p>
                </div>
              )}

              {/* Información específica según el rol */}
              {profileUser.role === 'tenant' && profileUser.tenantInfo && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Preferencias de Alquiler</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-600">
                          {profileUser.tenantInfo.employmentStatus === 'employed' ? 'Empleado' :
                           profileUser.tenantInfo.employmentStatus === 'self_employed' ? 'Autónomo' :
                           profileUser.tenantInfo.employmentStatus === 'student' ? 'Estudiante' :
                           'Buscando empleo'}
                        </span>
                      </div>
                      {profileUser.tenantInfo.monthlyIncome && (
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-600">
                            {profileUser.tenantInfo.monthlyIncome}€/mes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Información de contacto */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Información de Contacto</h2>
                {canViewProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-2" />
                      <span>{profileUser.email}</span>
                    </div>
                    {profileUser.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-2" />
                        <span>{profileUser.phone}</span>
                      </div>
                    )}
                    {profileUser.location && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-2" />
                        <span>{profileUser.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Miembro desde {format(new Date(profileUser.createdAt), 'MMMM yyyy')}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    La información de contacto está disponible solo para usuarios conectados
                  </p>
                )}
              </div>

              {/* Verificaciones */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Verificaciones</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Identidad</span>
                    {profileUser.verified ? (
                      <Shield className="h-5 w-5 text-green-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>
                  {profileUser.role === 'landlord' && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Propiedades</span>
                      <Shield className="h-5 w-5 text-green-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};