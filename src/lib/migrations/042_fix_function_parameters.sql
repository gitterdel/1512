-- Drop existing functions
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);
DROP FUNCTION IF EXISTS create_user(text, text, text, text, text, text);
DROP FUNCTION IF EXISTS create_properties(uuid, jsonb);

-- Create improved admin user function with consistent parameter names
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email text,
    admin_name text,
    admin_password text
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
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        now(),
        jsonb_build_object(
            'name', admin_name,
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
        admin_email,
        admin_name,
        'admin',
        'active',
        true,
        now(),
        now(),
        now()
    );

    SELECT jsonb_build_object(
        'id', v_user_id,
        'email', admin_email,
        'name', admin_name,
        'role', 'admin'
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;