import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
  role?: 'tenant' | 'landlord' | 'admin';
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Verificar si el usuario está autenticado pero no tiene datos
    if (isAuthenticated && !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar el rol requerido
  if (role && user.role !== role) {
    // Redirigir al dashboard correspondiente según el rol del usuario
    const dashboardPath = 
      user.role === 'admin' ? '/admin' :
      user.role === 'landlord' ? '/landlord/dashboard' :
      '/tenant/dashboard';
    
    return <Navigate to={dashboardPath} replace />;
  }

  // Verificar si la cuenta está suspendida
  if (user.status === 'suspended') {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Cuenta Suspendida</h2>
          <p className="text-gray-600">
            Tu cuenta ha sido suspendida. Por favor, contacta con el soporte para más información.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};