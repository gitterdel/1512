-- Drop existing function if exists
DROP FUNCTION IF EXISTS public.check_chat_exists;

-- Create improved chat existence check function
CREATE OR REPLACE FUNCTION public.check_chat_exists(
    p_participants uuid[],
    p_property_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    participants uuid[],
    property_id uuid,
    status text,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.participants,
        c.property_id,
        c.status,
        c.created_at,
        c.updated_at
    FROM public.chats c
    WHERE 
        c.participants @> p_participants AND
        c.participants <@ p_participants AND
        (p_property_id IS NULL OR c.property_id = p_property_id) AND
        c.status = 'active'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_chat_exists TO authenticated;

-- Create function to create new chat
CREATE OR REPLACE FUNCTION public.create_chat(
    p_participants uuid[],
    p_property_id uuid DEFAULT NULL
)
RETURNS TABLE(
    id uuid,
    participants uuid[],
    property_id uuid,
    status text,
    created_at timestamptz,
    updated_at timestamptz
) AS $$
DECLARE
    v_existing_chat record;
BEGIN
    -- Check if chat already exists
    SELECT * INTO v_existing_chat 
    FROM public.check_chat_exists(p_participants, p_property_id);
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            v_existing_chat.id,
            v_existing_chat.participants,
            v_existing_chat.property_id,
            v_existing_chat.status,
            v_existing_chat.created_at,
            v_existing_chat.updated_at;
        RETURN;
    END IF;

    -- Create new chat
    RETURN QUERY
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
        id,
        participants,
        property_id,
        status,
        created_at,
        updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_chat TO authenticated;