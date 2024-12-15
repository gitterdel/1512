-- Asegurarse de estar en el esquema público
SET search_path TO public;

-- Crear función para extensiones
CREATE OR REPLACE FUNCTION public.create_extensions()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar función para crear extensiones
SELECT public.create_extensions();

-- Eliminar tablas existentes
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.saved_properties CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Crear tabla de usuarios
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT,
    phone TEXT,
    location TEXT,
    date_of_birth DATE,
    bio TEXT,
    verified_at TIMESTAMPTZ
);

-- Crear tabla de propiedades
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    location TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('house', 'room')),
    landlord_id UUID REFERENCES public.users(id),
    images TEXT[] NOT NULL DEFAULT '{}',
    features JSONB NOT NULL DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    hidden BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0
);

-- Crear tabla de propiedades guardadas
CREATE TABLE public.saved_properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Crear tabla de reseñas
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(property_id, user_id)
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Políticas para propiedades
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