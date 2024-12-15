-- Función para crear extensiones de forma segura
CREATE OR REPLACE FUNCTION public.create_extensions()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar función para crear extensiones
SELECT public.create_extensions();

-- Función para crear políticas de forma segura
CREATE OR REPLACE FUNCTION public.create_safe_policy(
    p_table text,
    p_name text,
    p_action text,
    p_roles text[],
    p_using text DEFAULT NULL,
    p_check text DEFAULT NULL,
    p_with_check text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    -- Eliminar política si existe
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', p_name, p_table);
    
    -- Crear nueva política
    EXECUTE format(
        'CREATE POLICY %I ON %I FOR %s TO %s %s %s %s',
        p_name,
        p_table,
        p_action,
        array_to_string(p_roles, ','),
        COALESCE('USING (' || p_using || ')', ''),
        CASE WHEN p_check IS NOT NULL THEN 'WITH CHECK (' || p_check || ')' ELSE '' END,
        CASE WHEN p_with_check IS NOT NULL THEN 'WITH CHECK (' || p_with_check || ')' ELSE '' END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear tablas
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

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Crear políticas de forma segura
SELECT public.create_safe_policy(
    'users',
    'Enable read access for all users',
    'SELECT',
    ARRAY['public'],
    'true'
);

SELECT public.create_safe_policy(
    'users',
    'Enable insert for authenticated users',
    'INSERT',
    ARRAY['authenticated'],
    NULL,
    'true'
);

SELECT public.create_safe_policy(
    'users',
    'Enable update for own profile',
    'UPDATE',
    ARRAY['authenticated'],
    'auth.uid() = id'
);

SELECT public.create_safe_policy(
    'properties',
    'Enable read access for all properties',
    'SELECT',
    ARRAY['public'],
    'true'
);

SELECT public.create_safe_policy(
    'properties',
    'Enable insert for landlords',
    'INSERT',
    ARRAY['authenticated'],
    NULL,
    'EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN (''landlord'', ''admin''))'
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);