import { supabase } from './supabase';
import { DatabaseLogger } from './database-logger';
import { toast } from 'react-hot-toast';

export const checkDatabaseUpdates = async () => {
  try {
    DatabaseLogger.logInfo('Updates', 'Verificando actualizaciones de la base de datos');

    // First check if we can connect to the database
    const { error: connectionError } = await supabase
      .from('users')
      .select('count')
      .single();

    if (connectionError && !connectionError.message.includes('no rows')) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Check if properties table exists
    const { data: tablesExist, error: tablesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('properties', 'users')
        );
      `
    });

    if (tablesError) throw tablesError;

    // Create tables if they don't exist
    if (!tablesExist || !tablesExist[0]?.exists) {
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Create properties table if not exists
          CREATE TABLE IF NOT EXISTS public.properties (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC NOT NULL CHECK (price >= 100 AND price <= 10000),
            location TEXT NOT NULL,
            type TEXT NOT NULL CHECK (type IN ('house', 'room')),
            landlord_id UUID REFERENCES public.users(id),
            images TEXT[] NOT NULL DEFAULT '{}',
            features JSONB NOT NULL DEFAULT '{}',
            requirements JSONB DEFAULT '{
              "deposit": 2,
              "minStay": 6,
              "documents": {
                "payslips": true,
                "bankGuarantee": false,
                "idCard": true,
                "employmentContract": true,
                "taxReturns": false
              },
              "otherRequirements": []
            }'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          -- Create users table if not exists
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
            status TEXT NOT NULL DEFAULT 'active',
            verified BOOLEAN DEFAULT false,
            tenant_info JSONB DEFAULT '{
              "employmentStatus": "employed",
              "workplace": null,
              "monthlyIncome": null,
              "residencyStatus": "resident",
              "hasPets": false,
              "smoker": false,
              "preferredMoveInDate": null,
              "references": null,
              "documents": {
                "residencyPermit": false,
                "employmentContract": false,
                "bankStatements": false
              }
            }'::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      });

      if (createError) throw createError;
      DatabaseLogger.logInfo('Updates', 'Tablas creadas correctamente');
    }

    // Now check columns and add any missing ones
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT 
          table_name,
          column_name,
          data_type
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name IN ('properties', 'users');
      `
    });

    if (columnsError) throw columnsError;

    const updates = [];
    
    if (Array.isArray(columns)) {
      const propertiesColumns = columns.filter(c => c.table_name === 'properties');
      const usersColumns = columns.filter(c => c.table_name === 'users');

      // Check and add missing columns
      if (!propertiesColumns.find(c => c.column_name === 'requirements')) {
        updates.push(`
          ALTER TABLE public.properties 
          ADD COLUMN IF NOT EXISTS requirements JSONB DEFAULT '{
            "deposit": 2,
            "minStay": 6,
            "documents": {
              "payslips": true,
              "bankGuarantee": false,
              "idCard": true,
              "employmentContract": true,
              "taxReturns": false
            },
            "otherRequirements": []
          }'::jsonb;
        `);
      }

      if (!usersColumns.find(c => c.column_name === 'tenant_info')) {
        updates.push(`
          ALTER TABLE public.users
          ADD COLUMN IF NOT EXISTS tenant_info JSONB DEFAULT '{
            "employmentStatus": "employed",
            "workplace": null,
            "monthlyIncome": null,
            "residencyStatus": "resident",
            "hasPets": false,
            "smoker": false,
            "preferredMoveInDate": null,
            "references": null,
            "documents": {
              "residencyPermit": false,
              "employmentContract": false,
              "bankStatements": false
            }
          }'::jsonb;
        `);
      }
    }

    // Check and create indexes
    const { data: indexes, error: indexesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public'
        AND (tablename = 'properties' OR tablename = 'users');
      `
    });

    if (indexesError) throw indexesError;

    if (Array.isArray(indexes)) {
      if (!indexes.find(i => i.indexname === 'idx_properties_location')) {
        updates.push(`
          CREATE INDEX IF NOT EXISTS idx_properties_location 
          ON public.properties(location);
        `);
      }

      if (!indexes.find(i => i.indexname === 'idx_properties_price')) {
        updates.push(`
          CREATE INDEX IF NOT EXISTS idx_properties_price 
          ON public.properties(price);
        `);
      }
    }

    // Apply updates if needed
    if (updates.length > 0) {
      DatabaseLogger.logInfo('Updates', `Aplicando ${updates.length} actualizaciones`);

      for (const update of updates) {
        const { error: updateError } = await supabase.rpc('exec_sql', {
          sql_query: update
        });

        if (updateError) throw updateError;
      }

      toast.success('Base de datos actualizada correctamente');
      DatabaseLogger.logInfo('Updates', 'Actualizaciones completadas con éxito');
      return true;
    }

    DatabaseLogger.logInfo('Updates', 'La base de datos está actualizada');
    return false;
  } catch (error) {
    console.error('Error checking database updates:', error);
    DatabaseLogger.logError('Updates', error);
    toast.error('Error al verificar actualizaciones de la base de datos');
    throw error;
  }
};

export const applyDatabaseUpdates = async () => {
  try {
    const updatesNeeded = await checkDatabaseUpdates();
    
    if (updatesNeeded) {
      // Verify the updates were applied correctly
      const { error: verifyError } = await supabase.rpc('exec_sql', {
        sql_query: `
          SELECT 
            EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'properties' 
              AND column_name = 'requirements'
            ) as has_requirements,
            EXISTS (
              SELECT 1 
              FROM information_schema.columns 
              WHERE table_name = 'users' 
              AND column_name = 'tenant_info'
            ) as has_tenant_info;
        `
      });

      if (verifyError) throw verifyError;

      DatabaseLogger.logInfo('Updates', 'Verificación de actualizaciones completada');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error applying database updates:', error);
    DatabaseLogger.logError('Updates', error);
    toast.error('Error al aplicar actualizaciones de la base de datos');
    throw error;
  }
};