import React, { useState } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
}) => {
  const { login } = useSupabaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!email.trim()) {
      setError('Por favor, ingresa tu email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un email válido');
      return false;
    }

    if (!password.trim()) {
      setError('Por favor, ingresa tu contraseña');
      return false;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (!validateForm()) return;

      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setError(null);
          onEmailChange(e.target.value);
        }}
        placeholder="tu@email.com"
        required
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => {
          setError(null);
          onPasswordChange(e.target.value);
        }}
        placeholder="••••••••"
        required
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        isLoading={isLoading}
        icon={!isLoading ? <LogIn className="h-5 w-5" /> : undefined}
      >
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Credenciales de prueba:</h3>
        <div className="text-sm text-gray-600">
          <p>Admin: admin@renthub.com / Admin123!</p>
          <p>Propietario: landlord@example.com / Landlord123!</p>
          <p>Inquilino: maria@example.com / Tenant123!</p>
        </div>
      </div>
    </form>
  );
};