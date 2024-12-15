import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import { DatabaseLogger } from './database-logger';

class DatabaseInitializer {
  private static instance: DatabaseInitializer;
  private initialized = false;

  private constructor() {}

  public static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      DatabaseLogger.logInfo('Initialization', 'Starting database initialization');

      // Verificar conexión
      const { error: connectionError } = await supabase
        .from('users')
        .select('count')
        .single();

      if (connectionError && !connectionError.message.includes('no rows')) {
        throw connectionError;
      }

      // Crear tablas
      await this.createTables();
      
      // Crear políticas
      await this.createPolicies();
      
      // Crear usuario admin si no existe
      await this.createAdminUser();

      this.initialized = true;
      DatabaseLogger.logInfo('Initialization', 'Database initialized successfully');
    } catch (error) {
      DatabaseLogger.logError('Initialization', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Enable extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- Create users table
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

        -- Create properties table
        CREATE TABLE IF NOT EXISTS public.properties (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL CHECK (price >= 100 AND price <= 10000),
          location TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('house', 'room')),
          landlord_id UUID REFERENCES public.users(id),
          images TEXT[] NOT NULL DEFAULT '{}',
          features JSONB NOT NULL DEFAULT '{}',
          amenities TEXT[] DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          verified BOOLEAN DEFAULT false,
          verified_at TIMESTAMPTZ,
          hidden BOOLEAN DEFAULT false,
          views INTEGER DEFAULT 0,
          rating NUMERIC DEFAULT 0,
          featured BOOLEAN DEFAULT false
        );

        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
      `
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }

  private async createPolicies(): Promise<void> {
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Drop existing policies
        DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
        DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
        DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
        DROP POLICY IF EXISTS "Enable read access for all properties" ON public.properties;
        DROP POLICY IF EXISTS "Enable insert for landlords" ON public.properties;
        DROP POLICY IF EXISTS "Enable update for property owners" ON public.properties;

        -- Create user policies
        CREATE POLICY "Enable read access for all users"
          ON public.users FOR SELECT
          USING (true);

        CREATE POLICY "Enable insert for authenticated users"
          ON public.users FOR INSERT
          WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Enable update for own profile"
          ON public.users FOR UPDATE
          USING (
            auth.uid() = id OR
            EXISTS (
              SELECT 1 FROM public.users
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- Create property policies
        CREATE POLICY "Enable read access for all properties"
          ON public.properties FOR SELECT
          USING (true);

        CREATE POLICY "Enable insert for landlords"
          ON public.properties FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.users
              WHERE id = auth.uid() AND role IN ('landlord', 'admin')
            )
          );

        CREATE POLICY "Enable update for property owners"
          ON public.properties FOR UPDATE
          USING (
            landlord_id = auth.uid() OR
            EXISTS (
              SELECT 1 FROM public.users
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }
  }

  private async createAdminUser(): Promise<void> {
    try {
      // Check if admin exists
      const { data: adminExists, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'admin@renthub.com')
        .single();

      if (checkError && !checkError.message.includes('no rows')) {
        throw checkError;
      }

      if (adminExists) {
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

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Create admin profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: 'admin@renthub.com',
          name: 'Administrador',
          role: 'admin',
          status: 'active',
          verified: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          verified_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      DatabaseLogger.logInfo('Admin Creation', 'Admin user created successfully');
    } catch (error) {
      DatabaseLogger.logError('Admin Creation', error);
      throw error;
    }
  }
}

// Export singleton instance
export const databaseInitializer = DatabaseInitializer.getInstance();