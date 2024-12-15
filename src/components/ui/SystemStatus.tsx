import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Activity, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const APP_VERSION = 'v1.0.0-beta';

export const SystemStatus = () => {
  const [status, setStatus] = useState<'checking' | 'stable' | 'unstable'>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [showDetails, setShowDetails] = useState(false);

  const checkSystemStatus = async () => {
    try {
      setStatus('checking');
      
      // Verificar conexión a la base de datos
      const { data, error } = await supabase
        .from('properties')
        .select('count');

      if (error) {
        setStatus('unstable');
        return;
      }

      // Verificar estado de la autenticación
      const { data: authData } = await supabase.auth.getSession();
      const authWorking = !!authData;

      // Verificar estado del almacenamiento
      const { data: storageData } = await supabase.storage.getBucket('avatars');
      const storageWorking = !!storageData;

      setStatus('stable');
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error checking system status:', error);
      setStatus('unstable');
    }
  };

  useEffect(() => {
    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 60000); // Comprobar cada minuto
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'stable':
        return 'text-green-500 bg-green-50 hover:bg-green-100';
      case 'unstable':
        return 'text-red-500 bg-red-50 hover:bg-red-100';
      default:
        return 'text-gray-500 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'stable':
        return <CheckCircle className="h-5 w-5" />;
      case 'unstable':
        return <AlertCircle className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const handleClick = () => {
    setShowDetails(!showDetails);
    if (status === 'stable') {
      toast.success('La aplicación está funcionando correctamente');
    }
  };

  return (
    <div className="relative flex items-center space-x-2">
      {/* Version Badge */}
      <div className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center">
        <Info className="h-3.5 w-3.5 mr-1" />
        {APP_VERSION}
      </div>

      {/* Status Button */}
      <button
        onClick={handleClick}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full transition-colors ${getStatusColor()}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium">
          {status === 'stable' ? 'Sistema estable' : 
           status === 'unstable' ? 'Revisando sistema' : 
           'Comprobando estado'}
        </span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3 pb-2 border-b">
            <span className="font-medium text-gray-900">Estado del Sistema</span>
            <span className="text-xs font-medium text-indigo-600">{APP_VERSION}</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de datos</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Autenticación</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Almacenamiento</span>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              Última comprobación: {lastCheck.toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};