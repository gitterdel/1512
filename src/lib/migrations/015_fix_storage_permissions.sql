-- Create storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create or update storage tables
CREATE TABLE IF NOT EXISTS storage.buckets (
    id text PRIMARY KEY,
    name text NOT NULL,
    owner uuid REFERENCES auth.users,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[]
);

CREATE TABLE IF NOT EXISTS storage.objects (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    last_accessed_at timestamptz DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED,
    CONSTRAINT objects_bucketid_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id)
);

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB in bytes
    ARRAY['image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Avatar read access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar insert access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update access" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete access" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON public.users;

-- Create new storage policies
CREATE POLICY "Avatar read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Avatar insert access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (CASE
        WHEN metadata->>'content-type' = 'image/jpeg' THEN true
        WHEN metadata->>'content-type' = 'image/png' THEN true
        WHEN metadata->>'content-type' = 'image/gif' THEN true
        ELSE false
    END)
);

CREATE POLICY "Avatar update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
);

CREATE POLICY "Avatar delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND owner = auth.uid()
);

-- Update users table to handle avatar information
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_path TEXT;

-- Create policy for updating avatar fields
CREATE POLICY "Avatar fields update"
ON public.users
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id
)
WITH CHECK (
    auth.uid() = id
    AND (
        avatar_url IS NULL
        OR avatar_url LIKE 'https://%'
        OR avatar_url LIKE 'http://%'
    )
);