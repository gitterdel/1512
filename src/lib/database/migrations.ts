import { supabase } from '../supabase';

export const runMigrations = async () => {
  try {
    console.log('Running database migrations...');

    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Add missing columns to properties table
        ALTER TABLE public.properties 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

        -- Add missing columns to users table
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

        -- Add missing columns to reports table
        ALTER TABLE public.reports 
        ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS resolved_by UUID REFERENCES public.users(id);

        -- Update existing rows with default values
        UPDATE public.properties 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;

        UPDATE public.users 
        SET updated_at = created_at 
        WHERE updated_at IS NULL;

        -- Create or update indexes
        CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);
        CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
        CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_id);
        CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

        -- Update or create triggers
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS set_updated_at ON public.properties;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.properties
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at();

        DROP TRIGGER IF EXISTS set_updated_at ON public.users;
        CREATE TRIGGER set_updated_at
          BEFORE UPDATE ON public.users
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at();
      `
    });

    if (error) throw error;

    console.log('Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};