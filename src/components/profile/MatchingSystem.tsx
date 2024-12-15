import React from 'react';
import { User } from '../../types';
import { Check, X, Star, Shield, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'react-hot-toast';

interface MatchingSystemProps {
  tenant: User;
  landlord: User;
}

export const MatchingSystem: React.FC<MatchingSystemProps> = ({ tenant, landlord }) => {
  const handleApprove = () => {
    // Aquí iría la lógica para aprobar al inquilino
    toast.success('Inquilino aprobado');
  };

  const handleReject = () => {
    // Aquí iría la lógica para rechazar al inquilino
    toast.error('Inquilino rechazado');
  };

  const compatibilityScore = calculateCompatibility(tenant, landlord);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Compatibilidad</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600">Puntuación de compatibilidad</span>
          <span className="text-2xl font-bold text-indigo-600">{compatibilityScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 rounded-full h-2 transition-all duration-500"
            style={{ width: `${compatibilityScore}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-green-500 mr-2" />
            <span>Verificación de identidad</span>
          </div>
          {tenant.verified ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-500 mr-2" />
            <span>Capacidad económica</span>
          </div>
          {tenant.tenantInfo?.monthlyIncome ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <X className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            <span>Referencias previas</span>
          </div>
          <Check className="h-5 w-5 text-green-500" />
        </div>
      </div>

      <div className="flex space-x-4">
        <Button
          onClick={handleApprove}
          variant="primary"
          className="flex-1"
          icon={<Check className="h-5 w-5" />}
        >
          Aprobar
        </Button>
        <Button
          onClick={handleReject}
          variant="outline"
          className="flex-1"
          icon={<X className="h-5 w-5" />}
        >
          Rechazar
        </Button>
      </div>
    </div>
  );
};

const calculateCompatibility = (tenant: User, landlord: User): number => {
  let score = 0;
  let total = 0;

  // Verificación
  if (tenant.verified) score += 30;
  total += 30;

  // Capacidad económica
  if (tenant.tenantInfo?.monthlyIncome) {
    const incomeScore = Math.min(tenant.tenantInfo.monthlyIncome / 3000 * 40, 40);
    score += incomeScore;
  }
  total += 40;

  // Referencias
  if (tenant.tenantInfo?.references) score += 30;
  total += 30;

  return Math.round((score / total) * 100);
};