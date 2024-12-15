import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export const initializeDatabase = async () => {
  try {
    // Create tables
    const { error: setupError } = await supabase.rpc('exec', {
      query: `
        -- Create users table
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
          status TEXT NOT NULL DEFAULT 'active',
          verified BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Create properties table
        CREATE TABLE IF NOT EXISTS public.properties (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL,
          location TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('house', 'room')),
          landlord_id UUID REFERENCES public.users(id),
          images TEXT[] NOT NULL DEFAULT '{}',
          features JSONB NOT NULL DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'available',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

        -- Create basic policies
        CREATE POLICY "Public users are viewable by everyone" 
        ON public.users FOR SELECT 
        USING (true);

        CREATE POLICY "Users can update own data" 
        ON public.users FOR UPDATE 
        USING (auth.uid() = id);

        CREATE POLICY "Properties are viewable by everyone" 
        ON public.properties FOR SELECT 
        USING (true);

        CREATE POLICY "Landlords can insert properties" 
        ON public.properties FOR INSERT 
        WITH CHECK (auth.uid() = landlord_id);
      `
    });

    if (setupError) throw setupError;

    // Create admin user
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@renthub.com',
      password: 'Admin123!',
      options: {
        data: {
          name: 'Administrador',
          role: 'admin'
        }
      }
    });

    if (signUpError && !signUpError.message.includes('already registered')) {
      throw signUpError;
    }

    if (user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: 'admin@renthub.com',
          name: 'Administrador',
          role: 'admin',
          status: 'active',
          verified: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (profileError && !profileError.message.includes('duplicate key')) {
        throw profileError;
      }
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Error al inicializar la base de datos');
    return false;
  }
};