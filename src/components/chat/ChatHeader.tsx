import React, { useState } from 'react';
import { ArrowLeft, User, Home, ExternalLink, Shield, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Chat, Property } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatHeaderProps {
  chat: Chat;
  property?: Property;
  onPropertyClick?: () => void;
  onBack: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  chat,
  property,
  onPropertyClick,
  onBack
}) => {
  const navigate = useNavigate();
  const { user, registeredUsers } = useAuthStore();
  const { deleteChat } = useChatStore();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  const otherParticipantId = chat.participants.find(id => id !== user.id);
  const otherParticipant = otherParticipantId ? registeredUsers[otherParticipantId] : null;

  const handleProfileClick = () => {
    if (otherParticipantId) {
      navigate(`/profile/${otherParticipantId}`, {
        state: { fromChat: true, chatId: chat.id }
      });
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
      await deleteChat(chat.id);
      navigate('/messages');
    }
  };

  return (
    <div className="bg-white border-b px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Volver"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>

          {otherParticipant && (
            <div className="flex items-center space-x-3">
              <Avatar
                src={otherParticipant.avatar}
                name={otherParticipant.name}
                size="md"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{otherParticipant.name}</span>
                  {otherParticipant.verified && (
                    <Shield className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {format(chat.createdAt, "'Conversación iniciada el' d 'de' MMMM", { locale: es })}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleProfileClick}
            icon={<User className="h-4 w-4" />}
          >
            Ver perfil
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              icon={<MoreVertical className="h-4 w-4" />}
            />

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
                <button
                  onClick={handleDeleteChat}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar conversación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {property && (
        <div className="mt-2 pt-2 border-t">
          <button
            onClick={onPropertyClick}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 group"
          >
            <Home className="h-4 w-4" />
            <span>Re: {property.title}</span>
            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}
    </div>
  );
};