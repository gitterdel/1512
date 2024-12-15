-- Drop existing chat policies
DROP POLICY IF EXISTS "Enable chat creation for authenticated users" ON public.chats;
DROP POLICY IF EXISTS "Enable read access for chat participants" ON public.chats;
DROP POLICY IF EXISTS "Enable chat updates for participants" ON public.chats;

-- Create improved chat policies
CREATE POLICY "Enable chat creation"
    ON public.chats FOR INSERT
    TO authenticated
    WITH CHECK (
        -- User must be a participant
        auth.uid() = ANY(participants) AND
        -- Exactly 2 participants required
        array_length(participants, 1) = 2 AND
        -- All participants must exist and be active
        NOT EXISTS (
            SELECT 1 FROM unnest(participants) AS p_id
            LEFT JOIN public.users u ON u.id = p_id::uuid
            WHERE u.id IS NULL OR u.status != 'active'
        ) AND
        -- Property validation if provided
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

CREATE POLICY "Enable chat read access"
    ON public.chats FOR SELECT
    TO authenticated
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable chat updates"
    ON public.chats FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to check if chat exists
CREATE OR REPLACE FUNCTION public.check_chat_exists(
    p_participants uuid[],
    p_property_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    v_chat_id uuid;
BEGIN
    -- Find existing chat with same participants and property
    SELECT id INTO v_chat_id
    FROM public.chats
    WHERE 
        participants @> p_participants AND
        participants <@ p_participants AND
        COALESCE(property_id, uuid_nil()) = COALESCE(p_property_id, uuid_nil());
    
    RETURN v_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;