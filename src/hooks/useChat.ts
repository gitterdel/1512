import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

export const useChat = () => {
  const { user } = useAuthStore();
  const {
    chats,
    messages,
    activeChat,
    loading,
    error,
    initialized,
    initializeChats,
    sendMessage,
    markAsRead,
    createChat,
    setActiveChat,
    cleanup
  } = useChatStore();

  useEffect(() => {
    if (!initialized && !loading) {
      initializeChats().catch(console.error);
    }

    return () => {
      cleanup();
    };
  }, [initialized, loading, initializeChats, cleanup]);

  useEffect(() => {
    if (activeChat && user?.id && initialized) {
      markAsRead(activeChat, user.id).catch(console.error);
    }
  }, [activeChat, user?.id, initialized, markAsRead]);

  const currentChat = activeChat ? chats.find(c => c.id === activeChat) : null;
  const chatMessages = activeChat ? messages[activeChat] || [] : [];

  return {
    currentChat,
    messages: chatMessages,
    loading,
    error,
    initialized,
    sendMessage,
    createChat,
    setActiveChat,
    chats,
    activeChat
  };
};