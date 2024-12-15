import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chat, Message } from '../types/chat';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { produce } from 'immer';

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChat: string | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  subscription: any | null;
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
  initializeChats: () => Promise<void>;
  cleanup: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      messages: {},
      activeChat: null,
      initialized: false,
      loading: false,
      error: null,
      subscription: null,

      setActiveChat: (chatId) => {
        set({ activeChat: chatId });
      },

      sendMessage: async (data) => {
        try {
          const { error } = await supabase.rpc('send_message', {
            p_chat_id: data.chatId,
            p_content: data.content,
            p_sender_id: data.senderId,
            p_receiver_id: data.receiverId,
            p_property_id: data.propertyId
          });

          if (error) throw error;

          // Message will be added through real-time subscription
        } catch (error) {
          console.error('Error sending message:', error);
          toast.error('Error al enviar el mensaje');
          throw error;
        }
      },

      markAsRead: async (chatId, userId) => {
        try {
          const { error } = await supabase.rpc('mark_messages_read', {
            p_chat_id: chatId,
            p_user_id: userId
          });

          if (error) throw error;

          set(produce(state => {
            if (state.messages[chatId]) {
              state.messages[chatId] = state.messages[chatId].map(msg =>
                msg.receiverId === userId ? { ...msg, read: true } : msg
              );
            }
          }));
        } catch (error) {
          console.error('Error marking messages as read:', error);
          throw error;
        }
      },

      createChat: async (data) => {
        try {
          const { data: result, error } = await supabase.rpc('create_chat', {
            p_participants: data.participants,
            p_property_id: data.propertyId
          });

          if (error) throw error;

          const newChat: Chat = {
            id: result.chat_id,
            participants: result.chat_participants,
            propertyId: result.chat_property_id,
            createdAt: new Date(result.chat_created_at),
            updatedAt: new Date(result.chat_updated_at),
            status: result.chat_status,
            unreadCount: 0
          };

          set(produce(state => {
            state.chats.unshift(newChat);
            state.activeChat = newChat.id;
          }));

          return newChat.id;
        } catch (error) {
          console.error('Error creating chat:', error);
          toast.error('Error al crear el chat');
          throw error;
        }
      },

      deleteChat: async (chatId) => {
        try {
          const { error } = await supabase
            .from('chats')
            .update({ status: 'archived' })
            .eq('id', chatId);

          if (error) throw error;

          set(produce(state => {
            state.chats = state.chats.filter(chat => chat.id !== chatId);
            if (state.activeChat === chatId) {
              state.activeChat = null;
            }
            delete state.messages[chatId];
          }));

          toast.success('Chat archivado');
        } catch (error) {
          console.error('Error archiving chat:', error);
          toast.error('Error al archivar el chat');
          throw error;
        }
      },

      initializeChats: async () => {
        const state = get();
        if (state.initialized || state.loading) return;

        try {
          set({ loading: true, error: null });

          // Cleanup any existing subscription
          if (state.subscription) {
            supabase.removeChannel(state.subscription);
          }

          // Load initial data
          const [chatsResponse, messagesResponse] = await Promise.all([
            supabase.from('chats')
              .select('*')
              .eq('status', 'active')
              .order('updated_at', { ascending: false }),
            supabase.from('messages')
              .select('*')
              .order('created_at', { ascending: true })
          ]);

          if (chatsResponse.error) throw chatsResponse.error;
          if (messagesResponse.error) throw messagesResponse.error;

          const processedChats = (chatsResponse.data || []).map(chat => ({
            id: chat.id,
            participants: chat.participants,
            propertyId: chat.property_id,
            createdAt: new Date(chat.created_at),
            updatedAt: new Date(chat.updated_at),
            status: chat.status,
            unreadCount: 0
          }));

          const processedMessages = (messagesResponse.data || []).reduce((acc, msg) => {
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

          // Set up real-time subscription
          const subscription = supabase.channel('chat-updates')
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'messages'
            }, (payload) => {
              if (payload.eventType === 'INSERT') {
                const message = payload.new;
                set(produce(state => {
                  if (!state.messages[message.chat_id]) {
                    state.messages[message.chat_id] = [];
                  }
                  state.messages[message.chat_id].push({
                    id: message.id,
                    chatId: message.chat_id,
                    content: message.content,
                    senderId: message.sender_id,
                    receiverId: message.receiver_id,
                    createdAt: new Date(message.created_at),
                    read: message.read,
                    type: message.type
                  });
                }));
              }
            })
            .subscribe();

          set({
            chats: processedChats,
            messages: processedMessages,
            subscription,
            initialized: true,
            loading: false,
            error: null
          });

        } catch (error) {
          console.error('Error initializing chats:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Error al inicializar los chats',
            loading: false 
          });
          throw error;
        }
      },

      cleanup: () => {
        const state = get();
        if (state.subscription) {
          supabase.removeChannel(state.subscription);
        }
        set({
          subscription: null,
          initialized: false,
          loading: false,
          error: null
        });
      },

      reset: () => {
        const state = get();
        if (state.subscription) {
          supabase.removeChannel(state.subscription);
        }
        set({
          chats: [],
          messages: {},
          activeChat: null,
          initialized: false,
          loading: false,
          error: null,
          subscription: null
        });
      }
    }),
    {
      name: 'chat-storage',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
        activeChat: state.activeChat
      }),
      version: 3,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialized = false;
          state.loading = false;
          state.error = null;
          state.subscription = null;
        }
      }
    }
  )
);