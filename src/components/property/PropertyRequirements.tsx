import React from 'react';
import { DollarSign, Calendar, FileText, AlertTriangle } from 'lucide-react';
import { PropertyRequirements as Requirements } from '../../types';

interface PropertyRequirementsProps {
  requirements?: Requirements;
  isEditing?: boolean;
  onUpdate?: (requirements: Requirements) => void;
}

export const PropertyRequirements: React.FC<PropertyRequirementsProps> = ({
  requirements,
  isEditing = false,
  onUpdate
}) => {
  const defaultRequirements: Requirements = {
    deposit: 2,
    minStay: 6,
    documents: {
      payslips: true,
      bankGuarantee: false,
      idCard: true,
      employmentContract: true,
      taxReturns: false
    },
    otherRequirements: []
  };

  const currentRequirements = requirements || defaultRequirements;

  if (isEditing && onUpdate) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Requisitos del Alquiler</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fianza (meses)</label>
            <select
              value={currentRequirements.deposit}
              onChange={(e) => onUpdate({
                ...currentRequirements,
                deposit: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={1}>1 mes</option>
              <option value={2}>2 meses</option>
              <option value={3}>3 meses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Estancia mínima</label>
            <select
              value={currentRequirements.minStay}
              onChange={(e) => onUpdate({
                ...currentRequirements,
                minStay: parseInt(e.target.value)
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={1}>1 mes</option>
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documentación requerida
          </label>
          <div className="space-y-2">
            {Object.entries(currentRequirements.documents).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => onUpdate({
                    ...currentRequirements,
                    documents: {
                      ...currentRequirements.documents,
                      [key]: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600">
                  {key === 'payslips' ? 'Nóminas' :
                   key === 'bankGuarantee' ? 'Aval bancario' :
                   key === 'idCard' ? 'DNI/Pasaporte' :
                   key === 'employmentContract' ? 'Contrato laboral' :
                   'Declaración de la renta'}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Requisitos del Alquiler</h3>
        <div className="flex items-center text-yellow-600">
          <AlertTriangle className="h-5 w-5 mr-1" />
          <span className="text-sm">Requisitos obligatorios</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <DollarSign className="h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium">Fianza</p>
            <p className="text-sm text-gray-600">{currentRequirements.deposit} meses</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="font-medium">Estancia mínima</p>
            <p className="text-sm text-gray-600">{currentRequirements.minStay} meses</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <p className="font-medium">Documentación requerida</p>
        </div>
        <ul className="space-y-2 text-sm text-gray-600">
          {Object.entries(currentRequirements.documents)
            .filter(([_, value]) => value)
            .map(([key]) => (
              <li key={key} className="flex items-center">
                <span className="mr-2">•</span>
                {key === 'payslips' ? 'Nóminas de los últimos 3 meses' :
                 key === 'bankGuarantee' ? 'Aval bancario' :
                 key === 'idCard' ? 'DNI o Pasaporte' :
                 key === 'employmentContract' ? 'Contrato laboral' :
                 'Última declaración de la renta'}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};