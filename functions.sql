-- Function to create extensions
CREATE OR REPLACE FUNCTION public.create_extensions()
RETURNS void AS $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA public;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(
    admin_id UUID,
    admin_email TEXT,
    admin_name TEXT
) RETURNS void AS $$
BEGIN
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
        admin_id,
        admin_email,
        admin_name,
        'admin',
        'active',
        true,
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        last_login = NOW(),
        status = 'active',
        verified = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to sync user role
CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
        INSERT INTO public.users (
            id,
            email,
            name,
            role,
            created_at
        ) VALUES (
            NEW.id,
            NEW.email,
            NEW.raw_user_meta_data->>'name',
            NEW.raw_user_meta_data->>'role',
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            name = EXCLUDED.name,
            role = EXCLUDED.role;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user role sync
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_role();