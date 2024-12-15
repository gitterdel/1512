-- Drop existing functions
DROP FUNCTION IF EXISTS seed_initial_data CASCADE;

-- Create seed function with proper RLS bypass
CREATE OR REPLACE FUNCTION seed_initial_data(
    admin_email text,
    admin_name text,
    admin_password text
) RETURNS jsonb AS $$
DECLARE
    v_admin_id uuid;
    v_landlord_id uuid;
    v_tenant_id uuid;
BEGIN
    -- Disable RLS temporarily
    ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;

    -- Create admin user
    INSERT INTO auth.users (
        email,
        encrypted_password,
        raw_user_meta_data,
        email_confirmed_at,
        role
    ) VALUES (
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        jsonb_build_object('name', admin_name, 'role', 'admin'),
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
        admin_email,
        admin_name,
        'admin',
        'active',
        true,
        now(),
        now(),
        now()
    );

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
        jsonb_build_object('name', 'María García', 'role', 'tenant'),
        now(),
        'authenticated'
    )
    RETURNING id INTO v_tenant_id;

    INSERT INTO public.users (
        id,
        email,
        name,
        role,
        status,
        verified,
        created_at,
        last_login,
        verified_at,
        location,
        bio
    ) VALUES (
        v_tenant_id,
        'maria@example.com',
        'María García',
        'tenant',
        'active',
        true,
        now(),
        now(),
        now(),
        'Andorra la Vella',
        'Profesional responsable buscando apartamento céntrico'
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

    -- Re-enable RLS
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Initial data seeded successfully',
        'admin_id', v_admin_id,
        'landlord_id', v_landlord_id,
        'tenant_id', v_tenant_id
    );

EXCEPTION WHEN OTHERS THEN
    -- Re-enable RLS in case of error
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;