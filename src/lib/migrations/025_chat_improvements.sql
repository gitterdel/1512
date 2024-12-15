-- Asegurar que las tablas de chat existen y tienen la estructura correcta
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

-- Mejorar índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_messages_chat_unread 
ON public.messages(chat_id, receiver_id) 
WHERE NOT read;

CREATE INDEX IF NOT EXISTS idx_messages_chat_sender_receiver 
ON public.messages(chat_id, sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS idx_chats_participants 
ON public.chats USING GIN (participants);

CREATE INDEX IF NOT EXISTS idx_chats_property 
ON public.chats(property_id);

-- Función para enviar mensajes con mejor manejo de errores
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
    -- Verificar que el chat existe y el usuario es participante
    SELECT * INTO v_chat 
    FROM public.chats 
    WHERE id = p_chat_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Chat no encontrado';
    END IF;

    IF NOT (p_sender_id = ANY(v_chat.participants)) THEN
        RAISE EXCEPTION 'El remitente no es participante del chat';
    END IF;

    IF NOT (p_receiver_id = ANY(v_chat.participants)) THEN
        RAISE EXCEPTION 'El destinatario no es participante del chat';
    END IF;

    -- Insertar mensaje y retornar resultado
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

    -- Actualizar última actividad del chat
    UPDATE public.chats
    SET 
        updated_at = NOW(),
        last_message = jsonb_build_object(
            'content', p_content,
            'sender_id', p_sender_id,
            'created_at', NOW()
        )
    WHERE id = p_chat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para marcar mensajes como leídos
CREATE OR REPLACE FUNCTION public.mark_messages_read(
    p_chat_id uuid,
    p_user_id uuid
)
RETURNS void AS $$
BEGIN
    -- Verificar que el usuario es participante
    IF NOT EXISTS (
        SELECT 1 FROM public.chats
        WHERE id = p_chat_id
        AND p_user_id = ANY(participants)
    ) THEN
        RAISE EXCEPTION 'Usuario no es participante del chat';
    END IF;

    -- Marcar mensajes como leídos
    UPDATE public.messages
    SET read = true
    WHERE 
        chat_id = p_chat_id
        AND receiver_id = p_user_id
        AND NOT read;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de seguridad mejoradas
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Políticas para chats
CREATE POLICY "Enable chat access for participants"
    ON public.chats FOR ALL
    USING (
        auth.uid() = ANY(participants) OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Políticas para mensajes
CREATE POLICY "Enable message access for chat participants"
    ON public.messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.chats
            WHERE id = chat_id
            AND (
                auth.uid() = ANY(participants) OR
                EXISTS (
                    SELECT 1 FROM public.users
                    WHERE id = auth.uid() AND role = 'admin'
                )
            )
        )
    );

-- Permisos de ejecución
GRANT EXECUTE ON FUNCTION public.send_message TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_messages_read TO authenticated;