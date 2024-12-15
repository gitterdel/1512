import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxvcwxteuwjtvgweslhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmN3eHRldXdqdHZnd2VzbGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDcwNDMsImV4cCI6MjA0NzQyMzA0M30.x1sfV1hJQCyNfpuU4QmJS7zWxio1sFGreiq7yFdkZZA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabase() {
  try {
    console.log('Running database updates...');

    // Run all migrations in order
    const migrations = [
      'fix_chat_participants_final.sql',
      'fix_property_status_final.sql',
      'fix_avatar_columns.sql'
    ];

    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          -- Include the content of src/lib/migrations/${migration} here
          DO $$ 
          BEGIN
            -- Add avatar columns
            ALTER TABLE public.users
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS avatar_path TEXT;

            -- Update storage schema
            CREATE SCHEMA IF NOT EXISTS storage;

            -- Create storage tables
            CREATE TABLE IF NOT EXISTS storage.buckets (
              id text PRIMARY KEY,
              name text NOT NULL,
              owner uuid REFERENCES auth.users,
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now(),
              public boolean DEFAULT false,
              avif_autodetection boolean DEFAULT false,
              file_size_limit bigint,
              allowed_mime_types text[]
            );

            CREATE TABLE IF NOT EXISTS storage.objects (
              id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
              bucket_id text REFERENCES storage.buckets(id),
              name text NOT NULL,
              owner uuid REFERENCES auth.users,
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now(),
              last_accessed_at timestamptz DEFAULT now(),
              metadata jsonb DEFAULT '{}'::jsonb,
              path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
            );

            -- Enable RLS
            ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
            ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

            -- Create avatars bucket
            INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
            VALUES (
              'avatars',
              'avatars',
              true,
              2097152,
              ARRAY['image/jpeg', 'image/png', 'image/gif']
            )
            ON CONFLICT (id) DO UPDATE SET
              public = true,
              file_size_limit = 2097152,
              allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];

          EXCEPTION
            WHEN duplicate_object THEN NULL;
          END $$;
        `
      });

      if (error) {
        console.error(`Error running migration ${migration}:`, error);
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    console.log('Database updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateDatabase();