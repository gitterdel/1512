-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de usuarios
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de propiedades
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    type TEXT NOT NULL,
    landlord_id UUID REFERENCES public.users(id),
    images TEXT[] NOT NULL DEFAULT '{}',
    features JSONB NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Crear políticas
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