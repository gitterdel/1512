-- Fix storage policies
BEGIN;

-- Enable storage extension if not enabled
CREATE EXTENSION IF NOT EXISTS "storage";

-- Create public bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('public', 'public')
ON CONFLICT (id) DO NOTHING;

-- Update storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'public' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can update own objects"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

CREATE POLICY "Users can delete own objects"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'avatars' AND
    (storage.foldername(name))[2] = auth.uid()::text
);

COMMIT;