import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Search } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useChatStore } from '../../store/useChatStore';
import { usePropertyStore } from '../../store/usePropertyStore';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { PropertyPreview } from './PropertyPreview';
import { QuickProfileView } from './QuickProfileView';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';

export const ChatWindow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();
  const { 
    chats,
    messages: chatMessages,
    loading,
    error,
    initialized,
    sendMessage,
    activeChat,
    setActiveChat
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickProfile, setShowQuickProfile] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const currentChat = activeChat ? chats.find(c => c.id === activeChat) : null;
  const property = currentChat?.propertyId 
    ? properties.find(p => p.id === currentChat.propertyId) 
    : null;

  useEffect(() => {
    if (messagesEndRef.current && shouldScrollToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChat, shouldScrollToBottom]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldScrollToBottom(isNearBottom);
  };

  const handlePropertyClick = () => {
    if (property) {
      navigate(`/property/${property.id}`, { 
        state: { fromChat: true, chatId: activeChat }
      });
    }
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !user || !currentChat) return;

    try {
      setIsLoading(true);
      const otherParticipantId = currentChat.participants.find(id => id !== user.id);
      if (!otherParticipantId) {
        toast.error('No se encontró el destinatario');
        return;
      }

      await sendMessage({
        chatId: currentChat.id,
        content: inputValue.trim(),
        senderId: user.id,
        receiverId: otherParticipantId,
        propertyId: currentChat.propertyId
      });
      
      setInputValue('');
      setShouldScrollToBottom(true);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast.error('Error al enviar el mensaje');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    setShowQuickProfile(userId);
  };

  const handleViewFullProfile = (userId: string) => {
    navigate(`/profile/${userId}`, {
      state: { fromChat: true, chatId: activeChat }
    });
  };

  if (loading || !initialized) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error al cargar los mensajes</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentChat) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MessageSquare className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Selecciona una conversación
          </h3>
          <p className="text-gray-600 mb-6">
            O explora propiedades para iniciar una nueva
          </p>
          <Button
            onClick={() => navigate('/search')}
            variant="primary"
            icon={<Search className="h-5 w-5" />}
          >
            Explorar propiedades
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <ChatHeader 
        chat={currentChat} 
        property={property}
        onPropertyClick={handlePropertyClick}
        onBack={handleBack}
      />

      {property && (
        <div className="bg-white border-b px-4 py-2">
          <PropertyPreview 
            property={property} 
            onClick={handlePropertyClick}
          />
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={handleScroll}
      >
        <MessageList 
          messages={chatMessages[currentChat.id] || []} 
          currentUserId={user?.id}
          onProfileClick={handleProfileClick}
          onViewFullProfile={handleViewFullProfile}
        />
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSendMessage}
        disabled={isLoading}
        placeholder="Escribe un mensaje..."
      />

      {showQuickProfile && (
        <div className="absolute right-4 top-20">
          <QuickProfileView
            userId={showQuickProfile}
            onClose={() => setShowQuickProfile(null)}
            onViewFullProfile={() => handleViewFullProfile(showQuickProfile)}
          />
        </div>
      )}
    </div>
  );
};