import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import { StoreError } from '../store/useStoreUtils';

export const verifyDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .single();

    if (error) {
      // If the table doesn't exist, it's normal at startup
      if (error.code === 'PGRST116') {
        return true;
      }
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new StoreError('Error de conexión. Por favor, verifica tu conexión a internet.');
      }
      
      if (error.message.includes('not found')) {
        throw new StoreError('Error al conectar con la base de datos. Por favor, verifica la configuración.');
      }
    }
    
    throw new StoreError('Error al conectar con la base de datos');
  }
};