-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public buckets are viewable by everyone" ON storage.buckets;
  DROP POLICY IF EXISTS "Users can create buckets" ON storage.buckets;
  DROP POLICY IF EXISTS "Public objects are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload objects to public buckets" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;
EXCEPTION 
  WHEN undefined_table THEN 
    NULL;
END $$;

-- Create storage schema and tables if they don't exist
CREATE SCHEMA IF NOT EXISTS storage;

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
  bucket_id text REFERENCES storage.buckets(id),
  name text NOT NULL,
  owner uuid REFERENCES auth.users,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_accessed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create storage policies
CREATE POLICY "Public buckets are viewable by everyone"
  ON storage.buckets FOR SELECT
  USING (public = true);

CREATE POLICY "Users can create buckets"
  ON storage.buckets FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Public objects are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id IN (
    SELECT id FROM storage.buckets WHERE public = true
  ));

CREATE POLICY "Users can upload objects to public buckets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own objects"
  ON storage.objects FOR UPDATE
  USING (auth.uid() = owner);

CREATE POLICY "Users can delete their own objects"
  ON storage.objects FOR DELETE
  USING (auth.uid() = owner);

-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];