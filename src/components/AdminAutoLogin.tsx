import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export const AdminAutoLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@renthub.com',
          password: 'Admin123!'
        });

        if (signInError) throw signInError;
        if (!signInData.user) throw new Error('No se pudo iniciar sesión');

        // Get admin user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();

        if (userError) throw userError;
        if (!userData) throw new Error('No se encontró el usuario administrador');

        navigate('/admin');
      } catch (error: any) {
        console.error('Auto-login error:', error);
        setError(error.message || 'Error al iniciar sesión automáticamente');
        toast.error('Error al acceder al panel de administración');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    autoLogin();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Accediendo al panel de administración...</p>
      </div>
    </div>
  );
};