import { toast } from 'react-hot-toast';
import { supabase } from './supabase';

export class DatabaseLogger {
  private static readonly LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
  };

  static async logError(context: string, error: any, showToast: boolean = true) {
    const errorDetails = {
      message: error?.message || 'Unknown error',
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
      context
    };

    console.error(`[${context}] Error:`, errorDetails);

    if (showToast) {
      let userMessage = 'Error en la base de datos';
      
      if (error?.message?.includes('Failed to fetch')) {
        userMessage = 'Error de conexión. Por favor, verifica tu conexión a internet.';
      } else if (error?.code === '42501') {
        userMessage = 'No tienes permisos para realizar esta acción.';
      } else if (error?.code === '23505') {
        userMessage = 'Este registro ya existe.';
      }

      toast.error(userMessage);
    }

    try {
      await supabase.from('logs').insert([{
        level: this.LOG_LEVELS.ERROR,
        context,
        message: error?.message,
        details: errorDetails,
        created_at: new Date().toISOString()
      }]);
    } catch (logError) {
      console.error('Error logging to database:', logError);
    }
  }

  static async logInfo(context: string, message: string) {
    console.info(`[${context}] Info:`, message);

    try {
      await supabase.from('logs').insert([{
        level: this.LOG_LEVELS.INFO,
        context,
        message,
        created_at: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error logging info to database:', error);
    }
  }

  static async checkDatabaseHealth(): Promise<{
    status: 'healthy' | 'failed';
    error?: string;
    timestamp: string;
  }> {
    try {
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)
        .single();

      if (error && !error.message.includes('no rows')) {
        return {
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }
}