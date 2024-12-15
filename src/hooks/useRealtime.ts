import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../types/database';

type RealtimeChannel = ReturnType<typeof supabase.channel>;

export const useRealtime = <T extends keyof Database['public']['Tables']>(
  table: T,
  options?: {
    event?: 'INSERT' | 'UPDATE' | 'DELETE';
    filter?: string;
  }
) => {
  const [data, setData] = useState<Database['public']['Tables'][T]['Row'][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let channel: RealtimeChannel;

    const initializeRealtime = async () => {
      try {
        // Cargar datos iniciales
        const { data: initialData, error: initialError } = await supabase
          .from(table)
          .select('*');

        if (initialError) throw initialError;
        setData(initialData);

        // Suscribirse a cambios en tiempo real
        channel = supabase.channel(`public:${table}`);

        if (options?.event) {
          channel = channel.on(
            'postgres_changes',
            {
              event: options.event,
              schema: 'public',
              table: table,
              filter: options.filter,
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                setData((current) => [...current, payload.new as any]);
              } else if (payload.eventType === 'UPDATE') {
                setData((current) =>
                  current.map((item) =>
                    (item as any).id === payload.new.id ? payload.new : item
                  )
                );
              } else if (payload.eventType === 'DELETE') {
                setData((current) =>
                  current.filter((item) => (item as any).id !== payload.old.id)
                );
              }
            }
          );
        }

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsLoading(false);
          }
        });
      } catch (err) {
        console.error('Error in realtime subscription:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        toast.error('Error al conectar en tiempo real');
      }
    };

    initializeRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, options?.event, options?.filter]);

  return { data, error, isLoading };
};