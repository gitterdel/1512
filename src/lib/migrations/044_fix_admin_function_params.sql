-- Drop existing function
DROP FUNCTION IF EXISTS create_admin_user(text, text, text);

-- Create admin user function with consistent parameter names
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email text,
    admin_name text,
    admin_password text,
    OUT result jsonb
) RETURNS jsonb AS $$
BEGIN
    -- Validate inputs
    IF admin_email IS NULL OR admin_name IS NULL OR admin_password IS NULL THEN
        RAISE EXCEPTION 'Missing required parameters';
    END IF;

    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        result := jsonb_build_object(
            'error', 'User already exists',
            'code', 'USER_EXISTS'
        );
        RETURN;
    END IF;

    -- Create user in a transaction
    BEGIN
        -- Create auth user
        WITH auth_user AS (
            INSERT INTO auth.users (
                email,
                raw_user_meta_data,
                encrypted_password,
                email_confirmed_at,
                role
            ) VALUES (
                admin_email,
                jsonb_build_object(
                    'name', admin_name,
                    'role', 'admin'
                ),
                crypt(admin_password, gen_salt('bf')),
                now(),
                'authenticated'
            )
            RETURNING id, email
        )
        -- Create profile
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
        )
        SELECT
            id,
            email,
            admin_name,
            'admin',
            'active',
            true,
            now(),
            now(),
            now()
        FROM auth_user
        RETURNING jsonb_build_object(
            'id', id,
            'email', email,
            'name', name,
            'role', role
        ) INTO result;

        RETURN;
    EXCEPTION WHEN OTHERS THEN
        result := jsonb_build_object(
            'error', SQLERRM,
            'code', SQLSTATE
        );
        RETURN;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;