-- Drop existing functions
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);
DROP FUNCTION IF EXISTS create_user(text, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_properties(uuid, jsonb);

-- Create improved admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
    p_email text,
    p_name text,
    p_password text
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    -- Create auth user
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        role
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        jsonb_build_object(
            'name', p_name,
            'role', 'admin'
        ),
        now(),
        now(),
        'authenticated'
    );

    -- Create user profile
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        verified,
        created_at,
        last_login,
        verified_at
    ) VALUES (
        v_user_id,
        p_email,
        p_name,
        'admin',
        'active',
        true,
        now(),
        now(),
        now()
    );

    SELECT jsonb_build_object(
        'id', v_user_id,
        'email', p_email,
        'name', p_name,
        'role', 'admin'
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved user function
CREATE OR REPLACE FUNCTION create_user(
    p_email text,
    p_name text,
    p_role text,
    p_password text,
    p_location text DEFAULT NULL,
    p_bio text DEFAULT NULL
) RETURNS jsonb AS $$
DECLARE
    v_user_id uuid;
    v_result jsonb;
BEGIN
    -- Validate role
    IF p_role NOT IN ('tenant', 'landlord') THEN
        RAISE EXCEPTION 'Invalid role. Must be tenant or landlord';
    END IF;

    -- Create auth user
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_user_meta_data,
        created_at,
        updated_at,
        role
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        jsonb_build_object(
            'name', p_name,
            'role', p_role
        ),
        now(),
        now(),
        'authenticated'
    );

    -- Create user profile
    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        verified,
        location,
        bio,
        created_at,
        last_login
    ) VALUES (
        v_user_id,
        p_email,
        p_name,
        p_role,
        'active',
        true,
        p_location,
        p_bio,
        now(),
        now()
    );

    SELECT jsonb_build_object(
        'id', v_user_id,
        'email', p_email,
        'name', p_name,
        'role', p_role
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create improved properties function
CREATE OR REPLACE FUNCTION create_properties(
    p_landlord_id uuid,
    p_properties jsonb
) RETURNS jsonb AS $$
DECLARE
    v_property record;
    v_result jsonb := '[]'::jsonb;
BEGIN
    FOR v_property IN 
        SELECT * FROM jsonb_array_elements(p_properties)
    LOOP
        WITH inserted_property AS (
            INSERT INTO public.properties (
                title,
                description,
                price,
                location,
                type,
                landlord_id,
                images,
                features,
                status,
                verified,
                created_at,
                updated_at,
                verified_at
            ) VALUES (
                v_property->>'title',
                v_property->>'description',
                (v_property->>'price')::numeric,
                v_property->>'location',
                v_property->>'type',
                p_landlord_id,
                ARRAY(SELECT jsonb_array_elements_text(v_property->'images')),
                v_property->'features',
                COALESCE(v_property->>'status', 'available'),
                COALESCE((v_property->>'verified')::boolean, false),
                now(),
                now(),
                CASE WHEN (v_property->>'verified')::boolean THEN now() ELSE NULL END
            )
            RETURNING id, title, landlord_id
        )
        SELECT v_result || jsonb_build_object(
            'id', id,
            'title', title,
            'landlord_id', landlord_id
        )::jsonb INTO v_result
        FROM inserted_property;
    END LOOP;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_admin_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user(text, text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION create_properties(uuid, jsonb) TO authenticated;