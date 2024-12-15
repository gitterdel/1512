import React from 'react';
import { X, Shield, MapPin, Calendar, Briefcase, Dog, Cigarette, DollarSign, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface TenantProfileModalProps {
  tenantId: string;
  onClose: () => void;
}

export const TenantProfileModal: React.FC<TenantProfileModalProps> = ({
  tenantId,
  onClose
}) => {
  const { registeredUsers } = useAuthStore();
  const tenant = registeredUsers[tenantId];

  if (!tenant) return null;

  const age = tenant.dateOfBirth
    ? Math.floor(
        (new Date().getTime() - new Date(tenant.dateOfBirth).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Perfil del Inquilino</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            {tenant.avatar ? (
              <img
                src={tenant.avatar}
                alt={tenant.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-2xl font-semibold text-indigo-600">
                  {tenant.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold">{tenant.name}</h3>
                {tenant.verified && (
                  <Shield className="h-5 w-5 text-green-500" title="Verificado" />
                )}
              </div>
              <p className="text-gray-500">
                Miembro desde {format(new Date(tenant.createdAt), 'MMMM yyyy')}
              </p>
              {age && (
                <p className="text-gray-500">{age} años</p>
              )}
            </div>
          </div>

          {tenant.tenantInfo ? (
            <>
              {/* Información Laboral y Residencia */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-4">Información Laboral y Residencia</h4>
                <div className="space-y-3">
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
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span>Ingresos mensuales: {tenant.tenantInfo.monthlyIncome}€</span>
                    </div>
                  )}

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
                </div>
              </div>

              {/* Preferencias y Hábitos */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium mb-4">Preferencias y Hábitos</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Dog className="h-5 w-5 mr-2" />
                    <span>
                      {tenant.tenantInfo.hasPets
                        ? `Tiene mascota: ${tenant.tenantInfo.petDetails}`
                        : 'No tiene mascotas'}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Cigarette className="h-5 w-5 mr-2" />
                    <span>{tenant.tenantInfo.smoker ? 'Fumador' : 'No fumador'}</span>
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
              </div>

              {/* Documentación */}
              {tenant.tenantInfo.documents && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-4">Documentación Disponible</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(tenant.tenantInfo.documents).map(([key, value]) => (
                      value && (
                        <div key={key} className="flex items-center text-gray-600">
                          <FileText className="h-5 w-5 mr-2" />
                          <span>
                            {key === 'residencyPermit' ? 'Permiso de residencia' :
                             key === 'employmentContract' ? 'Contrato laboral' :
                             key === 'bankStatements' ? 'Extractos bancarios' :
                             key === 'idCard' ? 'DNI/Pasaporte' :
                             key === 'payslips' ? 'Nóminas' : key}
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Este inquilino no ha completado su perfil</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};