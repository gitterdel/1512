import React from 'react';
import { Check, X, User, Briefcase, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { User as UserType } from '../../types';

interface RentalRequestCardProps {
  tenant: UserType;
  propertyId: string;
  onApprove: () => void;
  onReject: () => void;
}

export const RentalRequestCard: React.FC<RentalRequestCardProps> = ({
  tenant,
  propertyId,
  onApprove,
  onReject,
}) => {
  if (!tenant || !tenant.tenantInfo) return null;

  return (
    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-indigo-900">Solicitud de Alquiler</h3>
        <div className="flex space-x-2">
          <button
            onClick={onApprove}
            className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
            title="Aprobar solicitud"
          >
            <Check className="h-5 w-5" />
          </button>
          <button
            onClick={onReject}
            className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
            title="Rechazar solicitud"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          {tenant.avatar ? (
            <img
              src={tenant.avatar}
              alt={tenant.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <User className="h-8 w-8 text-indigo-600" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-lg">{tenant.name}</h4>
            <p className="text-gray-600 text-sm">
              Miembro desde {format(new Date(tenant.createdAt), 'MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-gray-700">
            <Briefcase className="h-5 w-5 mr-2" />
            <span>
              {tenant.tenantInfo.employmentStatus === 'employed' && tenant.tenantInfo.workplace
                ? `Empleado en ${tenant.tenantInfo.workplace}`
                : tenant.tenantInfo.employmentStatus === 'self_employed'
                ? 'Autónomo'
                : tenant.tenantInfo.employmentStatus === 'student'
                ? 'Estudiante'
                : 'Buscando empleo'}
            </span>
          </div>

          <div className="flex items-center text-gray-700">
            <MapPin className="h-5 w-5 mr-2" />
            <span>
              {tenant.tenantInfo.residencyStatus === 'resident'
                ? 'Residente en Andorra'
                : tenant.tenantInfo.residencyStatus === 'temporary'
                ? 'Residencia temporal'
                : 'Pendiente de residencia'}
            </span>
          </div>

          {tenant.tenantInfo.preferredMoveInDate && (
            <div className="flex items-center text-gray-700">
              <Calendar className="h-5 w-5 mr-2" />
              <span>
                Fecha preferida de mudanza:{' '}
                {format(new Date(tenant.tenantInfo.preferredMoveInDate), 'dd/MM/yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <h5 className="font-medium mb-2">Información adicional</h5>
          <ul className="space-y-2 text-sm text-gray-600">
            {tenant.tenantInfo.monthlyIncome && (
              <li>• Ingresos mensuales: ${tenant.tenantInfo.monthlyIncome}</li>
            )}
            <li>
              • {tenant.tenantInfo.hasPets
                ? `Tiene mascota: ${tenant.tenantInfo.petDetails || 'No especificado'}`
                : 'No tiene mascotas'}
            </li>
            <li>• {tenant.tenantInfo.smoker ? 'Fumador' : 'No fumador'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};