import { supabase } from '../supabase';

export const enableExtensions = async () => {
  try {
    const { error } = await supabase.rpc('exec', {
      query: `
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      `
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error enabling extensions:', error);
    return false;
  }
};