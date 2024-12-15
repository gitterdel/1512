-- Drop existing message policies
DROP POLICY IF EXISTS "Enable message read access for participants" ON public.messages;
DROP POLICY IF EXISTS "Enable message creation for participants" ON public.messages;
DROP POLICY IF EXISTS "Enable message updates for participants" ON public.messages;

-- Create improved message policies
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
        -- Ensure sender is authenticated user
        auth.uid() = sender_id AND
        -- Ensure chat exists and user is participant
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE id = chat_id AND
            auth.uid() = ANY(participants) AND
            status = 'active'
        ) AND
        -- If property_id is provided, ensure it matches chat's property
        (
            property_id IS NULL OR
            EXISTS (
                SELECT 1 FROM public.chats
                WHERE id = chat_id AND property_id = messages.property_id
            )
        )
    );

CREATE POLICY "Enable message updates"
    ON public.messages FOR UPDATE
    TO authenticated
    USING (
        -- Allow sender, receiver, and admins to update messages
        auth.uid() = sender_id OR
        auth.uid() = receiver_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to send message
CREATE OR REPLACE FUNCTION public.send_message(
    p_chat_id uuid,
    p_content text,
    p_sender_id uuid,
    p_receiver_id uuid,
    p_property_id uuid DEFAULT NULL
)
RETURNS TABLE (
    message_id uuid,
    message_chat_id uuid,
    message_content text,
    message_sender_id uuid,
    message_receiver_id uuid,
    message_created_at timestamptz,
    message_read boolean,
    message_type text
) AS $$
BEGIN
    -- Verify chat exists and user is participant
    IF NOT EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = p_chat_id AND
        p_sender_id = ANY(participants) AND
        status = 'active'
    ) THEN
        RAISE EXCEPTION 'Chat not found or user not participant';
    END IF;

    -- Insert message
    RETURN QUERY
    WITH new_message AS (
        INSERT INTO public.messages (
            chat_id,
            content,
            sender_id,
            receiver_id,
            property_id,
            type,
            read,
            created_at
        )
        VALUES (
            p_chat_id,
            p_content,
            p_sender_id,
            p_receiver_id,
            p_property_id,
            'message',
            false,
            NOW()
        )
        RETURNING
            id AS message_id,
            chat_id AS message_chat_id,
            content AS message_content,
            sender_id AS message_sender_id,
            receiver_id AS message_receiver_id,
            created_at AS message_created_at,
            read AS message_read,
            type AS message_type
    )
    SELECT * FROM new_message;

    -- Update chat's updated_at timestamp
    UPDATE public.chats
    SET updated_at = NOW()
    WHERE id = p_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.send_message TO authenticated;