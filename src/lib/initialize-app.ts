import { supabase } from './supabase';
import { toast } from 'react-hot-toast';
import { databaseInitializer } from './database-initializer';
import { validateSession } from './auth-helpers';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { DatabaseLogger } from './database-logger';

export const initializeApp = async () => {
  try {
    DatabaseLogger.logInfo('App Initialization', 'Starting app initialization');

    // Initialize database
    await databaseInitializer.initialize();

    // Validate session and get user data
    const user = await validateSession();
    if (user) {
      useAuthStore.getState().setUser(user);
    }

    // Initialize stores
    const propertyStore = usePropertyStore.getState();
    await propertyStore.fetchProperties();

    DatabaseLogger.logInfo('App Initialization', 'App initialized successfully');
    return true;
  } catch (error) {
    DatabaseLogger.logError('App Initialization', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        toast.error('Error de conexión. Por favor, verifica tu conexión a internet.');
      } else if (error.message.includes('not found')) {
        toast.error('Error al conectar con la base de datos. Por favor, verifica la configuración.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.error('Error al inicializar la aplicación');
    }
    
    return false;
  }
};