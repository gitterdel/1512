import React, { useState } from 'react';
import { Shield, Upload, Check, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/useAuthStore';
import { toast } from 'react-hot-toast';

export const VerificationCenter: React.FC = () => {
  const { user, verifyUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const verificationSteps = [
    {
      id: 'identity',
      title: 'Verificación de Identidad',
      description: 'Sube tu DNI o pasaporte y realiza una verificación facial',
      status: user?.verified ? 'verified' : 'pending',
      required: true
    },
    {
      id: 'property',
      title: 'Certificación de Propietario',
      description: 'Sube las escrituras o documentos que acrediten la propiedad',
      status: user?.role === 'landlord' && user?.verified ? 'verified' : 'pending',
      required: user?.role === 'landlord'
    }
  ];

  const handleVerification = async (stepId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para verificar tu cuenta');
      return;
    }

    try {
      setIsSubmitting(true);
      await verifyUser(user.id);
      toast.success('Solicitud de verificación enviada correctamente');
    } catch (error) {
      console.error('Error during verification:', error);
      toast.error('Error al enviar la solicitud de verificación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-indigo-600" />
        <h2 className="text-lg font-semibold">Centro de Verificación</h2>
      </div>

      <div className="space-y-6">
        {verificationSteps.map((step) => (
          <div key={step.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{step.title}</h3>
              {step.status === 'verified' ? (
                <span className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-1" />
                  Verificado
                </span>
              ) : step.status === 'pending' ? (
                <span className="flex items-center text-yellow-600">
                  <Clock className="h-5 w-5 mr-1" />
                  Pendiente
                </span>
              ) : null}
            </div>
            <p className="text-gray-600 text-sm mb-4">{step.description}</p>
            
            {step.status === 'pending' && step.required && (
              <Button
                onClick={() => handleVerification(step.id)}
                variant="outline"
                icon={<Upload className="h-5 w-5" />}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Iniciar Verificación
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h4 className="font-medium">¿Por qué verificarse?</h4>
        </div>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Mayor visibilidad en los resultados de búsqueda</li>
          <li>• Aumenta la confianza de los usuarios</li>
          <li>• Acceso a funciones premium de la plataforma</li>
          <li>• Proceso de alquiler más rápido y seguro</li>
        </ul>
      </div>
    </div>
  );
};