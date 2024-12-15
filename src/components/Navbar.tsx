import React, { useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogIn, MessageSquare, Bell, Database } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { NotificationBell } from './ui/NotificationBell';
import { SystemStatus } from './ui/SystemStatus';
import { seedDatabase } from '../lib/seed-data';
import { toast } from 'react-hot-toast';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isSeeding, setIsSeeding] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleLogout = useCallback(async () => {
    try {
      setShowUserMenu(false);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  }, [logout, navigate]);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      toast.loading('Cargando datos iniciales...', { id: 'seed-data' });
      const success = await seedDatabase();
      if (success) {
        toast.success('Datos cargados correctamente', { id: 'seed-data' });
      } else {
        toast.error('Error al cargar los datos', { id: 'seed-data' });
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Error al cargar los datos', { id: 'seed-data' });
    } finally {
      setIsSeeding(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'tenant':
        return '/tenant/dashboard';
      case 'landlord':
        return '/landlord/dashboard';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  // Cerrar el menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && 
        buttonRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-800">RentHub</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'admin' && (
              <Button
                onClick={handleSeedData}
                variant="outline"
                size="sm"
                isLoading={isSeeding}
                icon={<Database className="h-4 w-4" />}
              >
                Cargar Datos
              </Button>
            )}

            <SystemStatus />
            
            <Button
              onClick={() => navigate('/messages')}
              variant="ghost"
              icon={<MessageSquare className="h-5 w-5" />}
            >
              Mensajes
            </Button>

            <NotificationBell />

            {user ? (
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                  />
                </button>

                {showUserMenu && (
                  <div 
                    ref={menuRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                  >
                    <Link
                      to={getDashboardLink()}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Mi Perfil
                    </Link>
                    {user.role === 'tenant' && (
                      <Link
                        to="/tenant/saved"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Guardados
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                variant="primary"
                icon={<LogIn className="h-5 w-5" />}
              >
                Iniciar Sesión
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};