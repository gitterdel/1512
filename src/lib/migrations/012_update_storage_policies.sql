-- Create storage policies for avatars bucket
BEGIN;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Avatar access policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar insert policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar update policy" ON storage.objects;
DROP POLICY IF EXISTS "Avatar delete policy" ON storage.objects;

-- Create new policies
CREATE POLICY "Avatar access policy" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'avatars');

CREATE POLICY "Avatar insert policy" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatar update policy" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Avatar delete policy" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
    bucket_id = 'avatars' AND 
    (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;