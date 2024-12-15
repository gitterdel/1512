import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export const setupDatabase = async () => {
  try {
    // First check if we can connect to the database
    const { error: connectionError } = await supabase
      .from('users')
      .select('count')
      .single();

    // Ignore "no rows" error as it's expected when the table is empty
    if (connectionError && !connectionError.message.includes('no rows')) {
      throw connectionError;
    }

    // Create exec_sql function if it doesn't exist
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
      `
    });

    if (funcError && !funcError.message.includes('already exists')) {
      throw funcError;
    }

    // Create policy helper function
    const { error: policyFuncError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
          policy_name text,
          table_name text,
          policy_definition text
        ) RETURNS void AS $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = table_name 
            AND policyname = policy_name
          ) THEN
            EXECUTE policy_definition;
          END IF;
        END;
        $$ LANGUAGE plpgsql;
      `
    });

    if (policyFuncError && !policyFuncError.message.includes('already exists')) {
      throw policyFuncError;
    }

    // Run setup script
    const { error: setupError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Enable extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- Create tables if they don't exist
        CREATE TABLE IF NOT EXISTS public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
          verified BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ DEFAULT NOW(),
          avatar_url TEXT,
          phone TEXT,
          location TEXT,
          date_of_birth DATE,
          bio TEXT,
          verified_at TIMESTAMPTZ,
          tenant_info JSONB DEFAULT '{}'::jsonb
        );

        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

        -- Create policies safely
        SELECT create_policy_if_not_exists(
          'Enable read access for all users',
          'users',
          'CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true)'
        );

        SELECT create_policy_if_not_exists(
          'Enable insert for authenticated users',
          'users',
          'CREATE POLICY "Enable insert for authenticated users" ON public.users FOR INSERT WITH CHECK (auth.role() = ''authenticated'')'
        );

        SELECT create_policy_if_not_exists(
          'Enable update for own profile',
          'users',
          'CREATE POLICY "Enable update for own profile" ON public.users FOR UPDATE USING (auth.uid() = id)'
        );
      `
    });

    if (setupError) throw setupError;

    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    toast.error('Error al configurar la base de datos');
    return false;
  }
};