import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Please ensure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

async function runMigrations() {
  try {
    console.log('Running database migrations...');

    // First, ensure we have the exec_sql function
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;
      `
    });

    if (funcError && !funcError.message.includes('already exists')) {
      throw new Error(`Failed to create exec_sql function: ${funcError.message}`);
    }

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '..', 'src', 'lib', 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    // Run each migration in order
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');

      const { error } = await supabase.rpc('exec_sql', {
        sql_query: sql
      });

      if (error) {
        // Ignore errors about relations already existing
        if (!error.message.includes('already exists')) {
          throw new Error(`Migration ${file} failed: ${error.message}`);
        }
      }
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

runMigrations();