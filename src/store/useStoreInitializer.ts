import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './useAuthStore';
import { usePropertyStore } from './usePropertyStore';
import { useChatStore } from './useChatStore';
import { supabase } from '../lib/supabase';
import { initializeDatabase } from '../lib/supabase';

export const useStoreInitializer = () => {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { setUser } = useAuthStore();
  const { fetchProperties } = usePropertyStore();
  const { chats, setActiveChat } = useChatStore();

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Initialize database first
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
          throw new Error('Error al inicializar la base de datos');
        }

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // Set user if session exists
        if (session?.user) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError && !userError.message.includes('no rows returned')) {
            throw userError;
          }

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              status: userData.status,
              verified: userData.verified,
              createdAt: new Date(userData.created_at),
              lastLogin: new Date(userData.last_login),
              avatar: userData.avatar_url,
              phone: userData.phone,
              location: userData.location,
              dateOfBirth: userData.date_of_birth ? new Date(userData.date_of_birth) : undefined,
              bio: userData.bio,
              verifiedAt: userData.verified_at ? new Date(userData.verified_at) : undefined
            });
          }
        }

        // Initialize properties with error handling
        try {
          await fetchProperties();
        } catch (propertiesError) {
          console.error('Error fetching properties:', propertiesError);
          // Don't throw here, just log the error and continue
        }

        // Set up real-time subscription for chat updates
        const chatSubscription = supabase
          .channel('chat-updates')
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'chats'
          }, (payload) => {
            // Handle chat updates in real-time
            if (payload.eventType === 'UPDATE' && payload.new) {
              const chatId = payload.new.id;
              // Update active chat if needed
              if (chatId === chats.find(c => c.id === chatId)?.id) {
                setActiveChat(chatId);
              }
            }
          })
          .subscribe();

        if (mounted) {
          setInitialized(true);
          setError(null);
        }

        return () => {
          chatSubscription.unsubscribe();
        };
      } catch (error) {
        console.error('Store initialization error:', error);
        
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Error al inicializar la aplicación'));
          toast.error('Error al cargar los datos iniciales');
          setUser(null);
          setInitialized(true);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [setUser, fetchProperties, chats, setActiveChat]);

  return { initialized, error };
};