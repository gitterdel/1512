import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';

export const useSupabaseAuth = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    try {
      // Sign in with Supabase auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Email o contraseña incorrectos');
        }
        throw authError;
      }

      if (!authData?.user?.id) {
        throw new Error('No se pudo iniciar sesión');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      // Map user data
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        status: profile.status,
        verified: profile.verified,
        createdAt: new Date(profile.created_at),
        lastLogin: new Date(profile.last_login),
        avatar: profile.avatar_url,
        phone: profile.phone,
        location: profile.location,
        dateOfBirth: profile.date_of_birth ? new Date(profile.date_of_birth) : undefined,
        bio: profile.bio,
        verifiedAt: profile.verified_at ? new Date(profile.verified_at) : undefined,
        tenantInfo: profile.tenant_info
      });

      toast.success('Sesión iniciada correctamente');

      // Navigate based on user role
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'landlord') {
        navigate('/landlord/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }

    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.error('Error al iniciar sesión');
      throw new Error('Error al iniciar sesión');
    }
  }, [setUser, navigate]);

  const register = useCallback(async (userData: {
    email: string;
    password: string;
    name: string;
    role: 'tenant' | 'landlord';
  }) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            role: userData.role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('Este email ya está registrado');
        }
        throw authError;
      }

      if (!authData?.user?.id) {
        throw new Error('No se pudo crear la cuenta');
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          status: 'active',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // Log in automatically
      await login(userData.email, userData.password);
      
      toast.success('Cuenta creada correctamente');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.error('Error al crear la cuenta');
      throw new Error('Error al crear la cuenta');
    }
  }, [login]);

  return {
    login,
    register
  };
};