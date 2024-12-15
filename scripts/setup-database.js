import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = 'https://rxvcwxteuwjtvgweslhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmN3eHRldXdqdHZnd2VzbGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDcwNDMsImV4cCI6MjA0NzQyMzA0M30.x1sfV1hJQCyNfpuU4QmJS7zWxio1sFGreiq7yFdkZZA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    // Read and execute initial setup SQL
    const setupSql = await fs.readFile(
      path.join(__dirname, '..', 'src', 'lib', 'migrations', '000_initial_setup.sql'),
      'utf8'
    );

    // Execute setup SQL
    const { error: setupError } = await supabase.rpc('exec_sql', {
      sql_query: setupSql
    });

    if (setupError && !setupError.message.includes('already exists')) {
      console.error('Error executing setup SQL:', setupError);
      throw setupError;
    }

    // Create admin user with new function signature
    const { data: adminData, error: adminError } = await supabase.rpc('create_admin_user', {
      admin_email: 'admin@renthub.com',
      admin_name: 'Administrador',
      admin_password: 'Admin123!'
    });

    if (adminError) {
      console.error('Error creating admin user:', adminError);
      throw adminError;
    }

    if (adminData?.success) {
      console.log('Admin user created successfully:', adminData);
    } else if (adminData?.error) {
      console.log('Admin user already exists');
    }

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  }
}

setupDatabase();