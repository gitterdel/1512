import { supabase } from './supabase';

export const checkAdminUsers = async () => {
  try {
    // Verificar usuarios admin
    const { data: adminUsers, error } = await supabase
      .from('users')
      .select('id, email, name, role, status')
      .eq('role', 'admin');

    if (error) {
      console.error('Error checking admin users:', error);
      return;
    }

    console.log('Admin users found:', adminUsers);
    return adminUsers;
  } catch (error) {
    console.error('Error in checkAdminUsers:', error);
  }
};