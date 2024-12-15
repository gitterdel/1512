-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create exec_sql function
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
    tenant_info JSONB DEFAULT '{
      "employmentStatus": "employed",
      "workplace": null,
      "monthlyIncome": null,
      "residencyStatus": "resident",
      "hasPets": false,
      "smoker": false,
      "preferredMoveInDate": null,
      "references": null,
      "documents": {
        "residencyPermit": false,
        "employmentContract": false,
        "bankStatements": false
      }
    }'::jsonb
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