import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Chat } from '../../types/chat';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { usePropertyStore } from '../../store/usePropertyStore';

interface ChatPreviewProps {
  chats: Chat[];
}

export const ChatPreview: React.FC<ChatPreviewProps> = ({ chats }) => {
  const navigate = useNavigate();
  const { user, registeredUsers } = useAuthStore();
  const { messages, setActiveChat } = useChatStore();
  const { properties } = usePropertyStore();

  if (!user) return null;

  if (chats.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No hay mensajes nuevos</p>
        <p className="text-sm mt-1">Los mensajes de inquilinos interesados aparecerán aquí</p>
      </div>
    );
  }

  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId);
    navigate('/messages');
  };

  return (
    <div className="divide-y">
      {chats.map(chat => {
        const otherParticipantId = chat.participants.find(id => id !== user.id);
        const otherParticipant = otherParticipantId ? registeredUsers[otherParticipantId] : null;
        const property = chat.propertyId ? properties.find(p => p.id === chat.propertyId) : null;
        const chatMessages = messages[chat.id] || [];
        const lastMessage = chatMessages[chatMessages.length - 1];
        const unreadCount = chatMessages.filter(msg => !msg.read && msg.receiverId === user.id).length;

        return (
          <button
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center space-x-3">
              {otherParticipant?.avatar ? (
                <img
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-lg font-semibold text-indigo-600">
                    {otherParticipant?.name.charAt(0)}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium truncate">
                    {otherParticipant?.name || 'Usuario'}
                  </p>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {format(new Date(lastMessage.createdAt), 'HH:mm')}
                    </span>
                  )}
                </div>

                {property && (
                  <p className="text-xs text-gray-500 truncate">
                    Re: {property.title}
                  </p>
                )}

                {lastMessage && (
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {lastMessage.content}
                  </p>
                )}
              </div>

              {unreadCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};