import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxvcwxteuwjtvgweslhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmN3eHRldXdqdHZnd2VzbGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDcwNDMsImV4cCI6MjA0NzQyMzA0M30.x1sfV1hJQCyNfpuU4QmJS7zWxio1sFGreiq7yFdkZZA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Check if admin profile exists first
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@renthub.com')
      .maybeSingle();

    if (existingProfile) {
      console.log('Admin user already exists');
      process.exit(0);
      return;
    }

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

    if (authError) {
      if (authError.message.includes('User already registered')) {
        // Try to get the existing user's ID
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@renthub.com',
          password: 'Admin123!'
        });

        if (signInError) throw signInError;
        if (!user) throw new Error('Could not retrieve admin user ID');

        // Create admin profile
        const { error: profileError } = await supabase
          .from('users')
          .insert([{
            id: user.id,
            email: 'admin@renthub.com',
            name: 'Administrador',
            role: 'admin',
            status: 'active',
            verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            verified_at: new Date().toISOString()
          }]);

        if (profileError && !profileError.message.includes('duplicate key')) {
          throw profileError;
        }

        console.log('Admin profile created successfully');
        process.exit(0);
        return;
      }
      throw authError;
    }

    if (!authData?.user?.id) {
      throw new Error('No user ID returned from auth signup');
    }

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
      }]);

    if (profileError) throw profileError;

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();