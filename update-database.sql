-- Actualizar tabla de propiedades
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS reports JSONB[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Actualizar tabla de usuarios
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ,
  DROP COLUMN IF EXISTS identity_verified,
  DROP COLUMN IF EXISTS documents_verified,
  DROP COLUMN IF EXISTS identity_verified_at,
  DROP COLUMN IF EXISTS documents_verified_at,
  DROP COLUMN IF EXISTS verification_documents;

-- Crear tabla de reportes si no existe
CREATE TABLE IF NOT EXISTS public.reports (
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

-- Habilitar RLS para la tabla de reportes
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Crear políticas para la tabla de reportes
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