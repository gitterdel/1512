import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { produce } from 'immer';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  registeredUsers: Record<string, User>;
  initialized: boolean;
  setUser: (user: User | null) => void;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<Record<string, User>>;
  initializeStore: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      registeredUsers: {},
      initialized: false,

      setUser: (user) => {
        set(produce((state) => {
          state.user = user;
          state.isAuthenticated = !!user;
          if (user) {
            state.registeredUsers[user.id] = user;
          }
        }));
      },

      updateUser: async (userId, updates) => {
        try {
          const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

          if (error) throw error;

          set(produce((state) => {
            if (state.registeredUsers[userId]) {
              state.registeredUsers[userId] = {
                ...state.registeredUsers[userId],
                ...updates
              };
            }
            if (state.user?.id === userId) {
              state.user = {
                ...state.user,
                ...updates
              };
            }
          }));

          toast.success('Usuario actualizado correctamente');
        } catch (error) {
          console.error('Error updating user:', error);
          toast.error('Error al actualizar el usuario');
          throw error;
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            registeredUsers: {}, 
            initialized: false 
          });
          
          toast.success('Sesión cerrada correctamente');
        } catch (error) {
          console.error('Error logging out:', error);
          toast.error('Error al cerrar sesión');
          throw error;
        }
      },

      fetchUsers: async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*');

          if (error) throw error;

          const users = data.reduce((acc, user) => ({
            ...acc,
            [user.id]: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              status: user.status,
              verified: user.verified,
              createdAt: new Date(user.created_at),
              lastLogin: new Date(user.last_login),
              avatar: user.avatar_url,
              phone: user.phone,
              location: user.location,
              dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth) : undefined,
              bio: user.bio,
              verifiedAt: user.verified_at ? new Date(user.verified_at) : undefined,
              tenantInfo: user.tenant_info
            }
          }), {});

          set({ registeredUsers: users });
          return users;
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.error('Error al cargar los usuarios');
          throw error;
        }
      },

      initializeStore: async () => {
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          if (session?.user) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) {
              if (!userError.message.includes('no rows')) {
                throw userError;
              }
              // User not found in database, sign out
              await supabase.auth.signOut();
              set({ user: null, isAuthenticated: false });
              return;
            }

            if (userData) {
              const user = {
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
                verifiedAt: userData.verified_at ? new Date(userData.verified_at) : undefined,
                tenantInfo: userData.tenant_info
              };

              set(produce((state) => {
                state.user = user;
                state.isAuthenticated = true;
                state.registeredUsers[user.id] = user;
              }));

              // Update last login
              await supabase
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userData.id);
            }
          }

          await get().fetchUsers();
          set({ initialized: true });
        } catch (error) {
          console.error('[Store Initialization] Error:', error);
          toast.error('Error al inicializar la aplicación');
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      reset: () => {
        set({
          user: null,
          isAuthenticated: false,
          registeredUsers: {},
          initialized: false
        });
      }
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        registeredUsers: state.registeredUsers
      })
    }
  )
);