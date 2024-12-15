import { supabase } from './supabase';

export const testConnection = async () => {
  try {
    // Test 1: Verify basic connection
    const { data: test1, error: error1 } = await supabase
      .from('users')
      .select('count')
      .single();
    
    console.log('Connection test:', error1 ? '❌ Failed' : '✅ Success');

    // Test 2: Verify database functionality
    const { error: error2 } = await supabase.rpc('version');

    console.log('Database functionality test:', error2 ? '❌ Failed' : '✅ Success');

    return {
      success: !error1 && !error2,
      results: {
        connection: !error1,
        functionality: !error2
      }
    };

  } catch (error) {
    console.error('Test error:', error);
    throw error;
  }
};