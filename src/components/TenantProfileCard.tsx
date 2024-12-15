import React from 'react';
import { User } from '../types';
import { Briefcase, MapPin, Calendar, Dog, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

interface TenantProfileCardProps {
  tenant: User;
  showActions?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}

export const TenantProfileCard: React.FC<TenantProfileCardProps> = ({
  tenant,
  showActions = false,
  onApprove,
  onReject,
}) => {
  if (!tenant.tenantInfo) return null;

  const age = tenant.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(tenant.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <img
            src={tenant.avatar || 'https://via.placeholder.com/100'}
            alt={tenant.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h3 className="text-xl font-semibold">{tenant.name}</h3>
            {age && <p className="text-gray-600">{age} años</p>}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-5 w-5 mr-2" />
            <span>
              {tenant.tenantInfo.residencyStatus === 'resident'
                ? 'Residente en Andorra'
                : tenant.tenantInfo.residencyStatus === 'temporary'
                ? 'Residencia temporal'
                : 'Pendiente de residencia'}
            </span>
          </div>

          <div className="flex items-center text-gray-600">
            <Briefcase className="h-5 w-5 mr-2" />
            <span>
              {tenant.tenantInfo.employmentStatus === 'employed'
                ? `Empleado en ${tenant.tenantInfo.workplace}`
                : tenant.tenantInfo.employmentStatus === 'self_employed'
                ? 'Autónomo'
                : tenant.tenantInfo.employmentStatus === 'student'
                ? 'Estudiante'
                : 'Buscando empleo'}
            </span>
          </div>

          {tenant.tenantInfo.monthlyIncome && (
            <div className="flex items-center text-gray-600">
              <span className="font-medium">
                Ingresos mensuales: ${tenant.tenantInfo.monthlyIncome}
              </span>
            </div>
          )}

          <div className="flex items-center text-gray-600">
            <Dog className="h-5 w-5 mr-2" />
            <span>
              {tenant.tenantInfo.hasPets
                ? `Tiene mascota: ${tenant.tenantInfo.petDetails}`
                : 'No tiene mascotas'}
            </span>
          </div>

          {tenant.tenantInfo.preferredMoveInDate && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>
                Fecha preferida de mudanza:{' '}
                {format(new Date(tenant.tenantInfo.preferredMoveInDate), 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>

        {tenant.bio && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Sobre mí</h4>
            <p className="text-gray-600">{tenant.bio}</p>
          </div>
        )}

        {showActions && (
          <div className="mt-6 flex space-x-4">
            <button
              onClick={onApprove}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Aprobar Inquilino
            </button>
            <button
              onClick={onReject}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
            >
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};