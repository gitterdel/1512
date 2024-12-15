import { supabase } from './supabase';

export const createAdminUser = async () => {
  const adminEmail = 'admin@renthub.com';
  const adminPassword = 'Admin123!';

  try {
    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          role: 'admin',
          name: 'Administrador'
        }
      }
    });

    if (authError) throw authError;

    if (!authData.user?.id) {
      throw new Error('No user ID returned from auth signup');
    }

    // Crear registro en users
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        name: 'Administrador',
        role: 'admin',
        verified: true,
        created_at: new Date().toISOString()
      });

    if (userError) throw userError;

    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};