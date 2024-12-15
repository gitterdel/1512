import { supabase } from '../supabase';

export const createUsersTable = async () => {
  try {
    const { error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (usersError && usersError.code === 'PGRST116') {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
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
            verified_at TIMESTAMPTZ
          );

          -- Enable RLS
          ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

          -- Create policies
          DO $$ 
          BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
            DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
            DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;

            -- Create new policies
            CREATE POLICY "Enable read access for all users"
              ON public.users FOR SELECT
              USING (true);

            CREATE POLICY "Enable insert for authenticated users"
              ON public.users FOR INSERT
              WITH CHECK (auth.role() = 'authenticated');

            CREATE POLICY "Enable update for own profile"
              ON public.users FOR UPDATE
              USING (auth.uid() = id);
          END $$;
        `
      });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating users table:', error);
    return false;
  }
};

export const createPropertiesTable = async () => {
  try {
    const { error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .limit(1)
      .single();

    if (propertiesError && propertiesError.code === 'PGRST116') {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
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
          ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

          -- Create policies
          DO $$ 
          BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Enable read access for all properties" ON public.properties;
            DROP POLICY IF EXISTS "Enable insert for landlords" ON public.properties;
            DROP POLICY IF EXISTS "Enable update for property owners" ON public.properties;

            -- Create new policies
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
          END $$;
        `
      });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating properties table:', error);
    return false;
  }
};

export const createReportsTable = async () => {
  try {
    const { error: reportsError } = await supabase
      .from('reports')
      .select('id')
      .limit(1)
      .single();

    if (reportsError && reportsError.code === 'PGRST116') {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.reports (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            type TEXT NOT NULL CHECK (type IN ('property', 'message', 'user')),
            target_id UUID NOT NULL,
            reporter_id UUID REFERENCES public.users(id),
            reason TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            resolved_at TIMESTAMPTZ,
            resolved_by UUID REFERENCES public.users(id)
          );

          -- Enable RLS
          ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

          -- Create policies
          DO $$ 
          BEGIN
            -- Drop existing policies if they exist
            DROP POLICY IF EXISTS "Enable read access for admins" ON public.reports;
            DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reports;

            -- Create new policies
            CREATE POLICY "Enable read access for admins"
              ON public.reports FOR SELECT
              USING (
                EXISTS (
                  SELECT 1 FROM public.users
                  WHERE id = auth.uid() AND role = 'admin'
                )
              );

            CREATE POLICY "Enable insert for authenticated users"
              ON public.reports FOR INSERT
              WITH CHECK (auth.uid() IS NOT NULL);
          END $$;
        `
      });

      if (error) throw error;
    }

    return true;
  } catch (error) {
    console.error('Error creating reports table:', error);
    return false;
  }
};