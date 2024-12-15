-- Drop existing chat policies
DROP POLICY IF EXISTS "Enable read access for chat participants" ON public.chats;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Enable update for chat participants" ON public.chats;
DROP POLICY IF EXISTS "Enable delete for chat participants" ON public.chats;

-- Create new chat policies
CREATE POLICY "Enable read access for chat participants"
    ON public.chats FOR SELECT
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable chat creation for authenticated users"
    ON public.chats FOR INSERT
    WITH CHECK (
        auth.uid() = ANY(participants) AND
        array_length(participants, 1) >= 2 AND
        CASE 
            WHEN property_id IS NOT NULL THEN
                EXISTS (
                    SELECT 1 FROM public.properties p
                    WHERE p.id = property_id AND (
                        p.landlord_id = auth.uid() OR
                        auth.uid() = ANY(participants)
                    )
                )
            ELSE true
        END
    );

CREATE POLICY "Enable chat updates for participants"
    ON public.chats FOR UPDATE
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable chat deletion for participants"
    ON public.chats FOR DELETE
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Drop existing message policies
DROP POLICY IF EXISTS "Enable read access for chat participants" ON public.messages;
DROP POLICY IF EXISTS "Enable insert for chat participants" ON public.messages;
DROP POLICY IF EXISTS "Enable update for message owners and receivers" ON public.messages;

-- Create new message policies
CREATE POLICY "Enable message read access for participants"
    ON public.messages FOR SELECT
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

CREATE POLICY "Enable message creation for participants"
    ON public.messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE id = chat_id AND auth.uid() = ANY(participants)
        ) AND
        auth.uid() = sender_id
    );

CREATE POLICY "Enable message updates for participants"
    ON public.messages FOR UPDATE
    USING (
        auth.uid() = sender_id OR
        auth.uid() = receiver_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN (participants);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);