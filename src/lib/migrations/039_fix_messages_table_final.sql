-- Drop existing messages table and recreate with correct structure
DO $$ 
BEGIN
  -- Drop existing table with cascade to remove dependencies
  DROP TABLE IF EXISTS public.messages CASCADE;

  -- Create messages table with correct structure
  CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id),
    receiver_id UUID REFERENCES public.users(id),
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'rental_request', 'rental_response')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    property_id UUID REFERENCES public.properties(id),
    metadata JSONB
  );

  -- Enable RLS
  ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
  CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
  CREATE INDEX IF NOT EXISTS idx_messages_property_id ON public.messages(property_id);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

  -- Create policies
  CREATE POLICY "Enable message read access"
    ON public.messages FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = chat_id AND (
          auth.uid() = ANY(participants) OR
          EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
          )
        )
      )
    );

  CREATE POLICY "Enable message creation"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = sender_id AND
      EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = chat_id AND
        auth.uid() = ANY(participants) AND
        status = 'active'
      )
    );

  CREATE POLICY "Enable message updates"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = sender_id OR
      auth.uid() = receiver_id OR
      EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
      )
    );

END $$;