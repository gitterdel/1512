import { supabase } from './supabase';

export const setupSupabase = async () => {
  try {
    // Enable email auth provider
    const { data: authSettings, error: authError } = await supabase.rpc('enable_auth_provider', {
      provider: 'email',
      enabled: true
    });

    if (authError) throw authError;

    // Create auth trigger for new users
    const { error: triggerError } = await supabase.rpc('exec', {
      query: `
        -- Create trigger to handle new user signups
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.users (id, email, name, role, status)
          VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'name',
            COALESCE(NEW.raw_user_meta_data->>'role', 'tenant'),
            'active'
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Drop existing trigger if exists
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

        -- Create new trigger
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    });

    if (triggerError) throw triggerError;

    // Create RLS policies
    const { error: policiesError } = await supabase.rpc('exec', {
      query: `
        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Users can view own profile"
          ON public.users
          FOR SELECT
          USING (auth.uid() = id);

        CREATE POLICY "Users can update own profile"
          ON public.users
          FOR UPDATE
          USING (auth.uid() = id);

        -- Allow public read access to basic user info
        CREATE POLICY "Public read access to basic user info"
          ON public.users
          FOR SELECT
          USING (true);
      `
    });

    if (policiesError) throw policiesError;

    return true;
  } catch (error) {
    console.error('Error setting up Supabase:', error);
    throw error;
  }
};