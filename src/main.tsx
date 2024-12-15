import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';
import { databaseInitializer } from './lib/database-initializer';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorMessage } from './components/ui/ErrorMessage';

const AppInitializer = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const init = async () => {
      try {
        await databaseInitializer.initialize();
        setIsInitialized(true);
      } catch (err) {
        console.error('Error initializing app:', err);
        setError(err instanceof Error ? err : new Error('Error al inicializar la aplicación'));
      }
    };

    init();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <ErrorMessage 
          message={error.message}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Iniciando aplicación...</p>
        </div>
      </div>
    );
  }

  return <App />;
};

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Algo salió mal</h2>
            <p className="text-gray-600">Por favor, recarga la página</p>
          </div>
        </div>
      }
    >
      <AppInitializer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#363636',
          },
        }}
      />
    </ErrorBoundary>
  </React.StrictMode>
);