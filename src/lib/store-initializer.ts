import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import { setupDatabase } from './database-setup';

export const initializeStores = async () => {
  try {
    // Initialize database first
    const dbInitialized = await setupDatabase();
    if (!dbInitialized) {
      throw new Error('Error al inicializar la base de datos');
    }

    // Check current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      // Reset stores and continue without session
      useAuthStore.getState().reset();
      useChatStore.getState().reset();
      return false;
    }

    // Initialize stores in parallel
    await Promise.allSettled([
      useAuthStore.getState().initializeStore(),
      usePropertyStore.getState().fetchProperties(),
      useChatStore.getState().initializeChats()
    ]);

    // If there's an active session, ensure user data is loaded
    if (session?.user) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (userError) {
          if (!userError.message.includes('Results contain 0 rows')) {
            throw userError;
          }
          // User not found in database, sign out
          await supabase.auth.signOut();
          useAuthStore.getState().reset();
          return false;
        }

        if (userData) {
          useAuthStore.getState().setUser({
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
          });

          // Update last login
          await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        useAuthStore.getState().reset();
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing stores:', error);
    toast.error('Error al inicializar la aplicación');
    
    // Reset all stores
    useAuthStore.getState().reset();
    useChatStore.getState().reset();
    
    return false;
  }
};