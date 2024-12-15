-- Add missing avatar columns and storage infrastructure
CREATE OR REPLACE FUNCTION setup_storage_and_avatars()
RETURNS void AS $$
BEGIN
  -- Add avatar columns if they don't exist
  ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_path TEXT;

  -- Create storage schema if it doesn't exist
  CREATE SCHEMA IF NOT EXISTS storage;

  -- Create buckets table if it doesn't exist
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

  -- Create objects table if it doesn't exist
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

  -- Create avatars bucket if it doesn't exist
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

  -- Drop existing policies
  DROP POLICY IF EXISTS "Public buckets are viewable by everyone" ON storage.buckets;
  DROP POLICY IF EXISTS "Users can create buckets" ON storage.buckets;
  DROP POLICY IF EXISTS "Public objects are viewable by everyone" ON storage.objects;
  DROP POLICY IF EXISTS "Users can upload objects to public buckets" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own objects" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own objects" ON storage.objects;

  -- Create new policies
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
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

  CREATE POLICY "Users can update their own objects"
    ON storage.objects FOR UPDATE
    USING (auth.uid() = owner);

  CREATE POLICY "Users can delete their own objects"
    ON storage.objects FOR DELETE
    USING (auth.uid() = owner);

  -- Create function to handle avatar updates
  CREATE OR REPLACE FUNCTION handle_avatar_update()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW.avatar_url IS NOT NULL AND NEW.avatar_url != OLD.avatar_url THEN
      NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  -- Create trigger for avatar updates
  DROP TRIGGER IF EXISTS on_avatar_update ON public.users;
  CREATE TRIGGER on_avatar_update
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    WHEN (NEW.avatar_url IS DISTINCT FROM OLD.avatar_url)
    EXECUTE FUNCTION handle_avatar_update();

END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT setup_storage_and_avatars();