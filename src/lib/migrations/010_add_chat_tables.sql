-- Create chats table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL,
    property_id UUID REFERENCES public.properties(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_message JSONB,
    CONSTRAINT valid_participants CHECK (array_length(participants, 1) >= 2)
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
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
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policies for chats
CREATE POLICY "Enable read access for chat participants"
    ON public.chats FOR SELECT
    USING (auth.uid() = ANY(participants));

CREATE POLICY "Enable insert for authenticated users"
    ON public.chats FOR INSERT
    WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Enable update for chat participants"
    ON public.chats FOR UPDATE
    USING (auth.uid() = ANY(participants));

CREATE POLICY "Enable delete for chat participants"
    ON public.chats FOR DELETE
    USING (auth.uid() = ANY(participants));

-- Create policies for messages
CREATE POLICY "Enable read access for chat participants"
    ON public.messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE id = chat_id
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Enable insert for chat participants"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE id = chat_id
            AND auth.uid() = ANY(participants)
        )
    );

CREATE POLICY "Enable update for message owners and receivers"
    ON public.messages FOR UPDATE
    USING (
        auth.uid() = sender_id OR
        auth.uid() = receiver_id
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- Create function to update chat's updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chats
    SET updated_at = NOW()
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update chat's timestamp on new message
DROP TRIGGER IF EXISTS update_chat_timestamp ON public.messages;
CREATE TRIGGER update_chat_timestamp
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_timestamp();