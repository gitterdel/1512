import React from 'react';
import { Home, User } from 'lucide-react';

interface RoleSelectorProps {
  role: 'tenant' | 'landlord';
  onRoleChange: (role: 'tenant' | 'landlord') => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ role, onRoleChange, disabled = false }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipo de cuenta
      </label>
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onRoleChange('tenant')}
          disabled={disabled}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-colors ${
            role === 'tenant'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
              : 'border-gray-200 hover:border-indigo-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <User className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Inquilino</span>
        </button>
        <button
          type="button"
          onClick={() => onRoleChange('landlord')}
          disabled={disabled}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center transition-colors ${
            role === 'landlord'
              ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
              : 'border-gray-200 hover:border-indigo-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Home className="h-6 w-6 mb-2" />
          <span className="text-sm font-medium">Propietario</span>
        </button>
      </div>
    </div>
  );
};