import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DatabaseLogger } from '../../lib/database-logger';
import { toast } from 'react-hot-toast';

export const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      
      // Verificar conexión básica
      const { data, error } = await supabase
        .from('users')
        .select('count');

      if (error) {
        DatabaseLogger.logError('ConnectionCheck', error, false);
        setStatus('error');
        setDetails({
          error: error.message,
          code: error.code,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar estado de la base de datos
      const healthCheck = await DatabaseLogger.checkDatabaseHealth();
      setDetails(healthCheck);

      if (healthCheck.status === 'failed') {
        setStatus('error');
        toast.error('Problemas con la conexión a la base de datos');
      } else {
        setStatus('connected');
      }
    } catch (error) {
      DatabaseLogger.logError('ConnectionCheck', error);
      setStatus('error');
      setDetails({
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-gray-400 bg-gray-100';
      case 'connected':
        return 'text-green-600 bg-green-100 hover:bg-green-200';
      case 'error':
        return 'text-red-600 bg-red-100 hover:bg-red-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Database className="h-5 w-5" />;
      case 'connected':
        return <Wifi className="h-5 w-5" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTooltipText = () => {
    switch (status) {
      case 'checking':
        return 'Verificando conexión...';
      case 'connected':
        return 'Conectado a Supabase';
      case 'error':
        return `Error de conexión: ${details?.error || 'Error desconocido'}`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={checkConnection}
        className={`p-2 rounded-full transition-colors ${getStatusColor()}`}
        title={getTooltipText()}
      >
        {getStatusIcon()}
      </button>

      {details && status === 'error' && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 text-sm">
          <p className="font-medium text-red-600 mb-2">Error de conexión</p>
          <p className="text-gray-600">{details.error}</p>
          {details.code && (
            <p className="text-gray-500 mt-1">Código: {details.code}</p>
          )}
          <p className="text-gray-400 text-xs mt-2">
            {new Date(details.timestamp).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};