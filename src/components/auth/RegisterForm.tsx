import React, { useState } from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSupabaseAuth } from '../../hooks/useSupabaseAuth';

interface RegisterFormProps {
  email: string;
  password: string;
  name: string;
  role: 'tenant' | 'landlord';
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onNameChange: (name: string) => void;
  onRoleChange: (role: 'tenant' | 'landlord') => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  email,
  password,
  name,
  role,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onRoleChange,
  isLoading = false,
}) => {
  const { register } = useSupabaseAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      setLocalLoading(true);

      // Validate name
      if (!name.trim()) {
        setLocalError('Por favor, ingresa tu nombre');
        return;
      }

      if (name.trim().length < 2) {
        setLocalError('El nombre debe tener al menos 2 caracteres');
        return;
      }

      // Validate email
      if (!email.trim()) {
        setLocalError('Por favor, ingresa tu email');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setLocalError('Por favor, ingresa un email válido');
        return;
      }

      // Validate password
      if (!password.trim()) {
        setLocalError('Por favor, ingresa una contraseña');
        return;
      }

      if (password.length < 6) {
        setLocalError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
      if (!passwordRegex.test(password)) {
        setLocalError('La contraseña debe contener al menos una mayúscula, un número y un carácter especial');
        return;
      }

      await register({
        email,
        password,
        name,
        role,
      });
    } catch (error) {
      if (error instanceof Error) {
        setLocalError(error.message);
      } else {
        setLocalError('Error al crear la cuenta');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {localError && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{localError}</p>
            </div>
          </div>
        </div>
      )}

      <Input
        label="Nombre completo"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Ingresa tu nombre"
        required
        disabled={localLoading || isLoading}
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        placeholder="tu@email.com"
        required
        disabled={localLoading || isLoading}
      />

      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        placeholder="••••••••"
        required
        disabled={localLoading || isLoading}
      />

      <RoleSelector role={role} onRoleChange={onRoleChange} disabled={localLoading || isLoading} />

      <Button
        type="submit"
        className="w-full"
        isLoading={localLoading || isLoading}
        disabled={localLoading || isLoading}
        icon={!localLoading && !isLoading ? <UserPlus className="h-5 w-5" /> : undefined}
      >
        {localLoading || isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
      </Button>

      <div className="mt-4 text-sm text-gray-600">
        <p>Al registrarte, aceptas nuestros términos y condiciones y política de privacidad.</p>
      </div>
    </form>
  );
};