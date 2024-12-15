-- Update users table to handle avatars
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Create RLS policy for avatar updates
DROP POLICY IF EXISTS "Users can update own avatar" ON public.users;

CREATE POLICY "Users can update own avatar"
    ON public.users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            avatar IS NULL OR
            avatar LIKE 'https://%' OR
            avatar LIKE 'http://%'
        )
    );