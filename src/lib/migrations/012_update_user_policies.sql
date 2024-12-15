-- Update RLS policies for users table to handle avatar updates
DROP POLICY IF EXISTS "Users can update own avatar" ON public.users;

CREATE POLICY "Users can update own avatar"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            NEW.avatar IS NULL OR
            NEW.avatar LIKE 'https://%' OR
            NEW.avatar LIKE 'http://%'
        )
    );