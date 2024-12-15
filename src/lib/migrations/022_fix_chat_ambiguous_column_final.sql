-- Drop existing functions
DROP FUNCTION IF EXISTS public.check_chat_exists;
DROP FUNCTION IF EXISTS public.create_chat;

-- Create improved chat existence check function with explicit table aliases
CREATE OR REPLACE FUNCTION public.check_chat_exists(
    p_participants uuid[],
    p_property_id uuid DEFAULT NULL
)
RETURNS TABLE(
    chat_id uuid,
    chat_participants uuid[],
    chat_property_id uuid,
    chat_status text,
    chat_created_at timestamptz,
    chat_updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        chats.id AS chat_id,
        chats.participants AS chat_participants,
        chats.property_id AS chat_property_id,
        chats.status AS chat_status,
        chats.created_at AS chat_created_at,
        chats.updated_at AS chat_updated_at
    FROM public.chats
    WHERE 
        chats.participants @> p_participants AND
        chats.participants <@ p_participants AND
        (p_property_id IS NULL OR chats.property_id = p_property_id) AND
        chats.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create new chat with explicit table aliases
CREATE OR REPLACE FUNCTION public.create_chat(
    p_participants uuid[],
    p_property_id uuid DEFAULT NULL
)
RETURNS TABLE(
    chat_id uuid,
    chat_participants uuid[],
    chat_property_id uuid,
    chat_status text,
    chat_created_at timestamptz,
    chat_updated_at timestamptz
) AS $$
DECLARE
    v_existing_chat record;
BEGIN
    -- Check if chat already exists
    SELECT * INTO v_existing_chat 
    FROM public.check_chat_exists(p_participants, p_property_id);
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            v_existing_chat.chat_id,
            v_existing_chat.chat_participants,
            v_existing_chat.chat_property_id,
            v_existing_chat.chat_status,
            v_existing_chat.chat_created_at,
            v_existing_chat.chat_updated_at;
        RETURN;
    END IF;

    -- Create new chat with explicit CTE column names
    RETURN QUERY
    WITH new_chat AS (
        INSERT INTO public.chats AS c (
            participants,
            property_id,
            status,
            created_at,
            updated_at
        )
        VALUES (
            p_participants,
            p_property_id,
            'active',
            NOW(),
            NOW()
        )
        RETURNING 
            c.id AS chat_id,
            c.participants AS chat_participants,
            c.property_id AS chat_property_id,
            c.status AS chat_status,
            c.created_at AS chat_created_at,
            c.updated_at AS chat_updated_at
    )
    SELECT 
        new_chat.chat_id,
        new_chat.chat_participants,
        new_chat.chat_property_id,
        new_chat.chat_status,
        new_chat.chat_created_at,
        new_chat.chat_updated_at
    FROM new_chat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_chat_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_chat TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_chats_participants_property 
ON public.chats USING btree (property_id)
INCLUDE (participants);