import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatList } from '../components/chat/ChatList';
import { ChatWindow } from '../components/chat/ChatWindow';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { chats, activeChat, setActiveChat, initialized, initializeChats } = useChatStore();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadChats = async () => {
      try {
        await initializeChats();
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };

    if (!initialized) {
      loadChats();
    }
  }, [user, navigate, initializeChats, initialized]);

  useEffect(() => {
    if (!activeChat && chats.length > 0) {
      const userChats = chats.filter(chat => 
        Array.isArray(chat.participants) && 
        chat.participants.includes(user?.id || '') && 
        chat.status === 'active'
      );
      if (userChats.length > 0) {
        setActiveChat(userChats[0].id);
      }
    }
  }, [chats, activeChat, user, setActiveChat]);

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Debes iniciar sesión para ver tus mensajes</p>
          <Button onClick={() => navigate('/login')}>
            Iniciar Sesión
          </Button>
        </div>
      </div>
    );
  }

  const userChats = chats.filter(chat => 
    Array.isArray(chat.participants) && 
    chat.participants.includes(user.id) && 
    chat.status === 'active'
  );

  if (userChats.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No tienes conversaciones
            </h2>
            <p className="text-gray-600 mb-6">
              Explora propiedades y contacta con propietarios para iniciar una conversación
            </p>
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-200px)]">
          <div className="border-r">
            <ChatList />
          </div>
          <div className="md:col-span-2">
            <ChatWindow />
          </div>
        </div>
      </div>
    </div>
  );
};