-- Fix chat participants column type
ALTER TABLE public.chats 
ALTER COLUMN participants TYPE uuid[] USING participants::uuid[];

-- Add check constraint for participants array
ALTER TABLE public.chats
ADD CONSTRAINT chats_participants_check 
CHECK (array_length(participants, 1) >= 2);

-- Create index for participants search
CREATE INDEX IF NOT EXISTS idx_chats_participants 
ON public.chats USING GIN (participants);

-- Update chat policies
DROP POLICY IF EXISTS "Enable chat creation" ON public.chats;
CREATE POLICY "Enable chat creation"
ON public.chats FOR INSERT
WITH CHECK (
  auth.uid()::uuid = ANY(participants) AND
  array_length(participants, 1) = 2 AND
  NOT EXISTS (
    SELECT 1 FROM unnest(participants) AS p_id
    LEFT JOIN public.users u ON u.id = p_id
    WHERE u.id IS NULL OR u.status != 'active'
  )
);