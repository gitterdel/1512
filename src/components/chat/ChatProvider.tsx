import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Chat, Message } from '../../types/chat';
import { toast } from 'react-hot-toast';

interface ChatContextType {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChat: string | null;
  loading: boolean;
  error: string | null;
  setActiveChat: (chatId: string | null) => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    propertyId?: string;
  }) => Promise<void>;
  markAsRead: (chatId: string, userId: string) => Promise<void>;
  createChat: (data: { participants: string[]; propertyId?: string }) => Promise<string>;
  deleteChat: (chatId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let chatSubscription: any;
    let messageSubscription: any;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial data
        const [chatsData, messagesData] = await Promise.all([
          supabase.from('chats')
            .select('*')
            .contains('participants', [user.id])
            .eq('status', 'active')
            .order('updated_at', { ascending: false }),
          supabase.from('messages')
            .select('*')
            .order('created_at', { ascending: true })
        ]);

        if (chatsData.error) throw chatsData.error;
        if (messagesData.error) throw messagesData.error;

        // Process chats
        const processedChats = chatsData.data.map(chat => ({
          id: chat.id,
          participants: chat.participants,
          propertyId: chat.property_id,
          createdAt: new Date(chat.created_at),
          updatedAt: new Date(chat.updated_at),
          status: chat.status,
          unreadCount: 0
        }));

        // Process messages
        const processedMessages = messagesData.data.reduce((acc, msg) => {
          if (!acc[msg.chat_id]) {
            acc[msg.chat_id] = [];
          }
          acc[msg.chat_id].push({
            id: msg.id,
            chatId: msg.chat_id,
            content: msg.content,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            createdAt: new Date(msg.created_at),
            read: msg.read,
            type: msg.type
          });
          return acc;
        }, {} as Record<string, Message[]>);

        setChats(processedChats);
        setMessages(processedMessages);

        // Set up real-time subscriptions
        chatSubscription = supabase
          .channel('chat-updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'chats',
            filter: `participants=cs.{${user.id}}`
          }, (payload) => {
            if (payload.eventType === 'INSERT') {
              setChats(prev => [...prev, {
                id: payload.new.id,
                participants: payload.new.participants,
                propertyId: payload.new.property_id,
                createdAt: new Date(payload.new.created_at),
                updatedAt: new Date(payload.new.updated_at),
                status: payload.new.status,
                unreadCount: 0
              }]);
            }
          })
          .subscribe();

        messageSubscription = supabase
          .channel('message-updates')
          .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          }, (payload) => {
            const newMessage = {
              id: payload.new.id,
              chatId: payload.new.chat_id,
              content: payload.new.content,
              senderId: payload.new.sender_id,
              receiverId: payload.new.receiver_id,
              createdAt: new Date(payload.new.created_at),
              read: payload.new.read,
              type: payload.new.type
            };

            setMessages(prev => ({
              ...prev,
              [payload.new.chat_id]: [
                ...(prev[payload.new.chat_id] || []),
                newMessage
              ]
            }));
          })
          .subscribe();

      } catch (err) {
        console.error('Error initializing chat:', err);
        setError(err instanceof Error ? err.message : 'Error al inicializar el chat');
      } finally {
        setLoading(false);
      }
    };

    initializeChat();

    return () => {
      if (chatSubscription) supabase.removeChannel(chatSubscription);
      if (messageSubscription) supabase.removeChannel(messageSubscription);
    };
  }, [user]);

  const sendMessage = async (data: {
    chatId: string;
    content: string;
    senderId: string;
    receiverId: string;
    propertyId?: string;
  }) => {
    try {
      const { data: result, error } = await supabase.rpc('send_message', {
        p_chat_id: data.chatId,
        p_content: data.content,
        p_sender_id: data.senderId,
        p_receiver_id: data.receiverId,
        p_property_id: data.propertyId
      });

      if (error) throw error;

      // El mensaje se añadirá a través de la suscripción en tiempo real
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al enviar el mensaje');
      throw err;
    }
  };

  const markAsRead = async (chatId: string, userId: string) => {
    try {
      const { error } = await supabase.rpc('mark_messages_read', {
        p_chat_id: chatId,
        p_user_id: userId
      });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [chatId]: prev[chatId]?.map(msg =>
          msg.receiverId === userId ? { ...msg, read: true } : msg
        ) || []
      }));
    } catch (err) {
      console.error('Error marking messages as read:', err);
      throw err;
    }
  };

  const createChat = async (data: { participants: string[]; propertyId?: string }): Promise<string> => {
    try {
      const { data: result, error } = await supabase.rpc('create_chat', {
        p_participants: data.participants,
        p_property_id: data.propertyId
      });

      if (error) throw error;

      return result.chat_id;
    } catch (err) {
      console.error('Error creating chat:', err);
      toast.error('Error al crear el chat');
      throw err;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .update({ status: 'archived' })
        .eq('id', chatId);

      if (error) throw error;

      setChats(prev => prev.filter(chat => chat.id !== chatId));
      setActiveChat(null);
      toast.success('Chat archivado');
    } catch (err) {
      console.error('Error archiving chat:', err);
      toast.error('Error al archivar el chat');
      throw err;
    }
  };

  return (
    <ChatContext.Provider value={{
      chats,
      messages,
      activeChat,
      loading,
      error,
      setActiveChat,
      sendMessage,
      markAsRead,
      createChat,
      deleteChat
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};