import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { Input } from '../ui/Input';
import { Chat } from '../../types/chat';
import { Avatar } from '../ui/Avatar';

export const ChatList: React.FC = () => {
  const { user, registeredUsers } = useAuthStore();
  const { chats, activeChat, setActiveChat, messages } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChats = useMemo(() => {
    if (!user) return [];
    
    return chats
      .filter(chat => {
        if (!Array.isArray(chat.participants)) return false;
        return chat.participants.includes(user.id) && chat.status === 'active';
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [chats, user]);

  const getOtherParticipant = (chat: Chat) => {
    if (!user || !Array.isArray(chat.participants)) return null;
    const otherParticipantId = chat.participants.find(id => id !== user.id);
    return otherParticipantId ? registeredUsers[otherParticipantId] : null;
  };

  if (!user) return null;

  if (filteredChats.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4 text-center text-gray-500">
        No hay conversaciones disponibles
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b">
        <Input
          placeholder="Buscar conversaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="h-5 w-5 text-gray-400" />}
        />
      </div>

      <div className="flex-1 overflow-y-auto divide-y">
        {filteredChats.map((chat) => {
          const otherParticipant = getOtherParticipant(chat);
          const chatMessages = messages[chat.id] || [];
          const lastMessage = chatMessages[chatMessages.length - 1];
          const unreadCount = chatMessages.filter(msg => !msg.read && msg.receiverId === user.id).length;
          
          return (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                activeChat === chat.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar
                  src={otherParticipant?.avatar}
                  name={otherParticipant?.name || 'Usuario'}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-medium truncate">
                      {otherParticipant?.name || 'Usuario'}
                    </p>
                    {lastMessage && (
                      <p className="text-xs text-gray-500">
                        {format(new Date(lastMessage.createdAt), 'HH:mm')}
                      </p>
                    )}
                  </div>
                  
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {lastMessage.content}
                    </p>
                  )}
                </div>

                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};