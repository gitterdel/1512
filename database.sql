-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.saved_properties CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    date_of_birth DATE,
    bio TEXT,
    verified_at TIMESTAMPTZ
);

-- Create properties table
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    price NUMERIC NOT NULL CHECK (price >= 100 AND price <= 10000),
    location TEXT NOT NULL CHECK (length(trim(location)) > 0),
    type TEXT NOT NULL CHECK (type IN ('house', 'room')),
    landlord_id UUID REFERENCES public.users(id),
    images TEXT[] NOT NULL DEFAULT '{}' CHECK (array_length(images, 1) > 0),
    features JSONB NOT NULL DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    hidden BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    featured BOOLEAN DEFAULT false,
    reports JSONB[] DEFAULT '{}'
);

-- Create reports table
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('property', 'message', 'user')),
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

-- Create policies
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

CREATE POLICY "Enable update for own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id OR 
           EXISTS (
               SELECT 1 FROM public.users 
               WHERE id = auth.uid() AND role = 'admin'
           ));

-- Property policies
CREATE POLICY "Enable read access for all properties"
    ON public.properties FOR SELECT
    TO PUBLIC
    USING (true);

CREATE POLICY "Enable property management for landlords and admins"
    ON public.properties
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND (role = 'landlord' OR role = 'admin')
        )
    );

-- Reports policies
CREATE POLICY "Enable read access for admins"
    ON public.reports FOR SELECT
    TO PUBLIC
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable report creation for authenticated users"
    ON public.reports FOR INSERT
    TO PUBLIC
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable report management for admins"
    ON public.reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );