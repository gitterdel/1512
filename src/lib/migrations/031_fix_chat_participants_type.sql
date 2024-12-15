-- Fix chat participants column type with a simpler approach
DO $$ 
BEGIN
  -- First create a temporary column
  ALTER TABLE public.chats 
  ADD COLUMN temp_participants uuid[];

  -- Update the temporary column
  UPDATE public.chats 
  SET temp_participants = ARRAY(
    SELECT DISTINCT UNNEST(participants)::uuid 
    WHERE UNNEST(participants) IS NOT NULL
  );

  -- Drop the old column
  ALTER TABLE public.chats 
  DROP COLUMN participants;

  -- Rename the temporary column
  ALTER TABLE public.chats 
  RENAME COLUMN temp_participants TO participants;

  -- Add NOT NULL constraint
  ALTER TABLE public.chats 
  ALTER COLUMN participants SET NOT NULL;

  -- Add check constraint
  ALTER TABLE public.chats
  ADD CONSTRAINT chats_participants_check 
  CHECK (array_length(participants, 1) >= 2);

  -- Create index
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
END $$;