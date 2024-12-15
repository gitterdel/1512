-- Drop existing functions
DROP FUNCTION IF EXISTS seed_initial_data CASCADE;

-- Create function to seed initial data bypassing RLS
CREATE OR REPLACE FUNCTION seed_initial_data(
    p_admin_email text,
    p_admin_password text,
    p_admin_name text DEFAULT 'Administrador',
    OUT result jsonb
) RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_admin_id uuid;
    v_landlord_id uuid;
BEGIN
    -- Create admin user if not exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = p_admin_email) THEN
        INSERT INTO auth.users (
            email,
            encrypted_password,
            raw_user_meta_data,
            email_confirmed_at,
            role
        ) VALUES (
            p_admin_email,
            crypt(p_admin_password, gen_salt('bf')),
            jsonb_build_object('name', p_admin_name, 'role', 'admin'),
            now(),
            'authenticated'
        )
        RETURNING id INTO v_admin_id;

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
            v_admin_id,
            p_admin_email,
            p_admin_name,
            'admin',
            'active',
            true,
            now(),
            now(),
            now()
        );
    END IF;

    -- Create landlord user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        raw_user_meta_data,
        email_confirmed_at,
        role
    ) VALUES (
        'landlord@example.com',
        crypt('Landlord123!', gen_salt('bf')),
        jsonb_build_object('name', 'Juan Propietario', 'role', 'landlord'),
        now(),
        'authenticated'
    )
    RETURNING id INTO v_landlord_id;

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
        v_landlord_id,
        'landlord@example.com',
        'Juan Propietario',
        'landlord',
        'active',
        true,
        now(),
        now(),
        now()
    );

    -- Create sample property
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
        'Apartamento moderno en Andorra la Vella',
        'Hermoso apartamento completamente amueblado con vistas espectaculares.',
        1200,
        'Andorra la Vella',
        'house',
        v_landlord_id,
        ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'],
        '{
            "bedrooms": 2,
            "bathrooms": 1,
            "size": 75,
            "furnished": true,
            "petsAllowed": false
        }'::jsonb,
        'available',
        true,
        now(),
        now(),
        now()
    );

    -- Create tenant user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        raw_user_meta_data,
        email_confirmed_at,
        role
    ) VALUES (
        'maria@example.com',
        crypt('Tenant123!', gen_salt('bf')),
        jsonb_build_object(
            'name', 'María García',
            'role', 'tenant'
        ),
        now(),
        'authenticated'
    );

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
        last_login,
        verified_at
    ) VALUES (
        gen_random_uuid(),
        'maria@example.com',
        'María García',
        'tenant',
        'active',
        true,
        'Andorra la Vella',
        'Profesional responsable buscando apartamento céntrico',
        now(),
        now(),
        now()
    );

    result := jsonb_build_object(
        'success', true,
        'message', 'Initial data seeded successfully'
    );

EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION seed_initial_data(text, text, text) TO authenticated;