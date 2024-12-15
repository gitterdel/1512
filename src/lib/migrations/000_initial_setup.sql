-- Enable required extensions
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

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_name TEXT,
    admin_password TEXT,
    OUT result JSONB
) RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Check if admin already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        result := jsonb_build_object(
            'success', false,
            'error', 'Admin user already exists'
        );
        RETURN;
    END IF;

    -- Create auth user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        raw_user_meta_data,
        email_confirmed_at,
        role
    ) VALUES (
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        jsonb_build_object('name', admin_name, 'role', 'admin'),
        now(),
        'authenticated'
    )
    RETURNING id INTO v_user_id;

    -- Create admin profile
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        verified,
        created_at,
        last_login,
        verified_at
    ) VALUES (
        v_user_id,
        admin_email,
        admin_name,
        'admin',
        'active',
        true,
        now(),
        now(),
        now()
    );

    result := jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'email', admin_email,
        'name', admin_name,
        'role', 'admin'
    );

EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;