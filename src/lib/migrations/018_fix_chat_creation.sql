-- Drop existing chat policies
DROP POLICY IF EXISTS "Enable chat creation for authenticated users" ON public.chats;

-- Create improved chat creation policy
CREATE POLICY "Enable chat creation for authenticated users"
    ON public.chats FOR INSERT
    WITH CHECK (
        -- Ensure current user is one of the participants
        auth.uid() = ANY(participants) AND
        -- Ensure there are exactly 2 participants
        array_length(participants, 1) = 2 AND
        -- Validate property access if property_id is provided
        CASE 
            WHEN property_id IS NOT NULL THEN
                EXISTS (
                    SELECT 1 FROM public.properties p
                    WHERE p.id = property_id AND (
                        -- Allow if user is landlord or tenant
                        p.landlord_id = auth.uid() OR
                        auth.uid() = ANY(participants)
                    )
                )
            ELSE true
        END AND
        -- Ensure all participants exist and are active
        NOT EXISTS (
            SELECT 1 FROM unnest(participants) AS participant_id
            LEFT JOIN public.users u ON u.id = participant_id
            WHERE u.id IS NULL OR u.status != 'active'
        )
    );