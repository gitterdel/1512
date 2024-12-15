-- Create exec functions first
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

CREATE OR REPLACE FUNCTION public.exec(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
GRANT EXECUTE ON FUNCTION public.exec(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.exec(text) TO anon;

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
    verified_at TIMESTAMPTZ
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

-- Create reports table
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
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all properties" ON public.properties;
DROP POLICY IF EXISTS "Enable insert for landlords" ON public.properties;
DROP POLICY IF EXISTS "Enable update for property owners" ON public.properties;
DROP POLICY IF EXISTS "Enable read access for admins" ON public.reports;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.reports;

-- Create policies for users
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Create policies for properties
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

-- Create policies for reports
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS set_updated_at ON public.properties;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Create admin user if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE email = 'admin@renthub.com'
    ) THEN
        INSERT INTO public.users (
            email,
            name,
            role,
            status,
            verified,
            created_at,
            updated_at,
            last_login,
            verified_at
        ) VALUES (
            'admin@renthub.com',
            'Administrador',
            'admin',
            'active',
            true,
            NOW(),
            NOW(),
            NOW(),
            NOW()
        );
    END IF;
END
$$;