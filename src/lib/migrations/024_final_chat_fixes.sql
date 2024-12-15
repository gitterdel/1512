-- Drop existing functions and policies
DROP FUNCTION IF EXISTS public.send_message;
DROP POLICY IF EXISTS "Enable message creation" ON public.messages;

-- Improved message sending function
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
DECLARE
    v_chat record;
BEGIN
    -- Get chat and verify user is participant
    SELECT * INTO v_chat 
    FROM public.chats 
    WHERE id = p_chat_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chat not found';
    END IF;

    IF NOT (p_sender_id = ANY(v_chat.participants)) THEN
        RAISE EXCEPTION 'Sender is not a chat participant';
    END IF;

    IF NOT (p_receiver_id = ANY(v_chat.participants)) THEN
        RAISE EXCEPTION 'Receiver is not a chat participant';
    END IF;

    -- Insert message and return result
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
            COALESCE(p_property_id, v_chat.property_id),
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

-- Improved message creation policy
CREATE POLICY "Enable message creation"
    ON public.messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = chat_id
            AND auth.uid() = sender_id
            AND auth.uid() = ANY(c.participants)
            AND receiver_id = ANY(c.participants)
            AND c.status = 'active'
            AND (
                property_id IS NULL OR
                property_id = c.property_id
            )
        )
    );

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_messages_read(
    p_chat_id uuid,
    p_user_id uuid
)
RETURNS void AS $$
BEGIN
    -- Verify user is participant
    IF NOT EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = p_chat_id
        AND p_user_id = ANY(participants)
    ) THEN
        RAISE EXCEPTION 'User is not a chat participant';
    END IF;

    -- Mark messages as read
    UPDATE public.messages
    SET read = true
    WHERE chat_id = p_chat_id
    AND receiver_id = p_user_id
    AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.send_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_read TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_unread 
ON public.messages(chat_id, receiver_id) 
WHERE NOT read;

CREATE INDEX IF NOT EXISTS idx_messages_chat_sender_receiver 
ON public.messages(chat_id, sender_id, receiver_id);