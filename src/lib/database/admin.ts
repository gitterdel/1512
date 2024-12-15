import { supabase } from '../supabase';

export const createAdminUser = async () => {
  try {
    // Check if admin exists
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@renthub.com')
      .maybeSingle();

    if (adminError && adminError.code !== 'PGRST116') {
      throw adminError;
    }

    // Only create admin if it doesn't exist
    if (!adminData) {
      // Create admin auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@renthub.com',
        password: 'Admin123!',
        options: {
          data: {
            name: 'Administrador',
            role: 'admin'
          }
        }
      });

      if (authError && !authError.message.includes('User already registered')) {
        throw authError;
      }

      if (authData?.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user.id,
            email: 'admin@renthub.com',
            name: 'Administrador',
            role: 'admin',
            status: 'active',
            verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            verified_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError && !profileError.message.includes('duplicate key value')) {
          throw profileError;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error creating admin user:', error);
    return false;
  }
};