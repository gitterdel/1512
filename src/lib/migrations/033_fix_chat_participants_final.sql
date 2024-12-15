-- Fix chat participants column type with cascade
DO $$ 
BEGIN
  -- First drop dependent policies
  DROP POLICY IF EXISTS "Chat access policy" ON public.chats;
  DROP POLICY IF EXISTS "Message access policy" ON public.messages;
  
  -- Create temporary column
  ALTER TABLE public.chats 
  ADD COLUMN IF NOT EXISTS temp_participants uuid[];

  -- Update temporary column with proper subquery
  UPDATE public.chats c
  SET temp_participants = ARRAY(
    SELECT DISTINCT p::uuid
    FROM unnest(c.participants) AS p
    WHERE p IS NOT NULL
  );

  -- Drop old column with cascade
  ALTER TABLE public.chats 
  DROP COLUMN participants CASCADE;

  -- Rename temporary column
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

  -- Recreate chat policies
  CREATE POLICY "Chat access policy"
    ON public.chats FOR ALL
    USING (
      auth.uid()::uuid = ANY(participants) OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

  -- Recreate message policies
  CREATE POLICY "Message access policy"
    ON public.messages FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = chat_id AND (
          auth.uid()::uuid = ANY(participants) OR
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
      )
    );
END $$;