-- Drop existing functions
DROP FUNCTION IF EXISTS public.check_chat_exists;
DROP FUNCTION IF EXISTS public.create_chat;

-- Create improved chat existence check function
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
        c.id AS chat_id,
        c.participants AS chat_participants,
        c.property_id AS chat_property_id,
        c.status AS chat_status,
        c.created_at AS chat_created_at,
        c.updated_at AS chat_updated_at
    FROM public.chats c
    WHERE 
        c.participants @> p_participants AND
        c.participants <@ p_participants AND
        (p_property_id IS NULL OR c.property_id = p_property_id) AND
        c.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create new chat with unambiguous column names
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

    -- Create new chat
    RETURN QUERY
    WITH new_chat AS (
        INSERT INTO public.chats (
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
            id AS chat_id,
            participants AS chat_participants,
            property_id AS chat_property_id,
            status AS chat_status,
            created_at AS chat_created_at,
            updated_at AS chat_updated_at
    )
    SELECT * FROM new_chat;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_chat_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_chat TO authenticated;