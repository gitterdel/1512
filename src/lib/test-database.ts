import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');

    // Test 1: Verificar conexión básica
    const { data: test1, error: error1 } = await supabase
      .from('users')
      .select('count')
      .single();
    
    console.log('Connection test:', error1 ? '❌ Failed' : '✅ Success');

    // Test 2: Intentar crear un usuario de prueba
    const testUser = {
      email: 'test@example.com',
      name: 'Test User',
      role: 'tenant',
      status: 'active'
    };

    const { data: test2, error: error2 } = await supabase
      .from('users')
      .insert(testUser)
      .select()
      .single();

    console.log('Insert test:', error2 ? '❌ Failed' : '✅ Success');
    
    // Test 3: Verificar políticas RLS
    const { data: test3, error: error3 } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test@example.com')
      .single();

    console.log('RLS test:', error3 ? '❌ Failed' : '✅ Success');

    // Test 4: Verificar extensiones
    const { data: test4, error: error4 } = await supabase.rpc('exec', {
      query: `
        SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
        ) as uuid_enabled,
        EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
        ) as pgcrypto_enabled;
      `
    });

    console.log('Extensions test:', error4 ? '❌ Failed' : '✅ Success');

    // Limpiar datos de prueba
    if (test2?.id) {
      await supabase
        .from('users')
        .delete()
        .eq('id', test2.id);
    }

    return {
      success: !error1 && !error2 && !error3 && !error4,
      results: {
        connection: !error1,
        insert: !error2,
        rls: !error3,
        extensions: !error4
      }
    };

  } catch (error) {
    console.error('Database test error:', error);
    toast.error('Error al probar la base de datos');
    throw error;
  }
};