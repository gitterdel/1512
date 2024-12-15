-- Create functions to bypass RLS for initial setup
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email TEXT,
    admin_name TEXT,
    admin_password TEXT
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
    VALUES (
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        jsonb_build_object('name', admin_name, 'role', 'admin')
    )
    RETURNING id INTO v_user_id;

    -- Create user profile bypassing RLS
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
        admin_email,
        admin_name,
        'admin',
        'active',
        true,
        NOW(),
        NOW(),
        NOW()
    );

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create regular users
CREATE OR REPLACE FUNCTION create_user(
    user_email TEXT,
    user_name TEXT,
    user_role TEXT,
    user_password TEXT,
    user_location TEXT DEFAULT NULL,
    user_bio TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Create auth user
    INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
    VALUES (
        user_email,
        crypt(user_password, gen_salt('bf')),
        jsonb_build_object(
            'name', user_name,
            'role', user_role
        )
    )
    RETURNING id INTO v_user_id;

    -- Create user profile bypassing RLS
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
        user_email,
        user_name,
        user_role,
        'active',
        true,
        user_location,
        user_bio,
        NOW(),
        NOW()
    );

    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create properties bypassing RLS
CREATE OR REPLACE FUNCTION create_properties(
    landlord_id UUID,
    properties JSONB
) RETURNS VOID AS $$
BEGIN
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
    )
    SELECT
        p->>'title',
        p->>'description',
        (p->>'price')::numeric,
        p->>'location',
        p->>'type',
        landlord_id,
        ARRAY(SELECT jsonb_array_elements_text(p->'images')),
        p->'features',
        COALESCE(p->>'status', 'available'),
        COALESCE((p->>'verified')::boolean, false),
        NOW(),
        NOW(),
        CASE WHEN (p->>'verified')::boolean THEN NOW() ELSE NULL END
    FROM jsonb_array_elements(properties) p;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check database state
CREATE OR REPLACE FUNCTION check_database_state()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'initialized', EXISTS (
            SELECT 1 FROM public.users 
            WHERE role = 'admin' 
            LIMIT 1
        ),
        'users_count', (SELECT COUNT(*) FROM public.users),
        'properties_count', (SELECT COUNT(*) FROM public.properties)
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION create_admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION create_user TO authenticated;
GRANT EXECUTE ON FUNCTION create_properties TO authenticated;
GRANT EXECUTE ON FUNCTION check_database_state TO authenticated;