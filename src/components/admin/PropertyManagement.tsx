import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { Eye, EyeOff, Trash2, Star, Shield, Check, AlertTriangle, Clock } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { usePropertyStore } from '../../store/usePropertyStore';

interface PropertyManagementProps {
  properties: Property[];
  onPropertyAction: (action: string, propertyId: string, data?: any) => void;
}

export const PropertyManagement: React.FC<PropertyManagementProps> = ({
  properties,
  onPropertyAction,
}) => {
  const navigate = useNavigate();
  const { toggleVisibility } = usePropertyStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'verified'>('pending');
  const [displayProperties, setDisplayProperties] = useState<Property[]>([]);

  const updateDisplayProperties = () => {
    const pendingProperties = properties.filter(p => !p.verified);
    const verifiedProperties = properties.filter(p => p.verified);
    
    setDisplayProperties(selectedTab === 'pending' ? pendingProperties : verifiedProperties);
  };

  useEffect(() => {
    updateDisplayProperties();
  }, [properties, selectedTab]);

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  const handleVerificationAction = async (propertyId: string, isVerified: boolean) => {
    try {
      const updates = {
        verified: !isVerified,
        verified_at: !isVerified ? new Date().toISOString() : null,
        status: !isVerified ? 'available' : 'pending'
      };
      
      await onPropertyAction('verify', propertyId, updates);
      
      toast.success(isVerified ? 
        'Verificación removida. La propiedad está pendiente de verificación' : 
        'Propiedad verificada correctamente'
      );

      updateDisplayProperties();
    } catch (error) {
      console.error('Error updating property verification:', error);
      toast.error('Error al actualizar el estado de verificación');
    }
  };

  const handleVisibilityToggle = async (propertyId: string) => {
    try {
      await toggleVisibility(propertyId);
      updateDisplayProperties();
    } catch (error) {
      console.error('Error toggling property visibility:', error);
      toast.error('Error al cambiar la visibilidad de la propiedad');
    }
  };

  const pendingCount = properties.filter(p => !p.verified).length;
  const verifiedCount = properties.filter(p => p.verified).length;

  const getVerificationStatus = (property: Property) => {
    if (property.verified) {
      return {
        icon: <Shield className="h-4 w-4" />,
        text: 'Verificada',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: 'Pendiente',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200'
      };
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              selectedTab === 'pending'
                ? 'border-yellow-600 text-yellow-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setSelectedTab('verified')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              selectedTab === 'verified'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Verificadas ({verifiedCount})
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="space-y-4">
        {displayProperties.map((property) => {
          const status = getVerificationStatus(property);
          
          return (
            <div key={property.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-start space-x-4">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{property.title}</h3>
                      <p className="text-gray-500">{property.location}</p>
                      <p className="text-indigo-600 font-medium">{formatPrice(property.price)}/mes</p>
                      
                      {/* Status Badges */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                          {status.icon}
                          <span className="ml-2">{status.text}</span>
                        </span>
                        {property.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                            <Star className="h-3 w-3 mr-1" />
                            Destacada
                          </span>
                        )}
                        {property.hidden && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Oculta
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProperty(property.id)}
                        icon={<Eye className="h-4 w-4" />}
                      >
                        Ver
                      </Button>

                      <Button
                        variant={property.verified ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleVerificationAction(property.id, property.verified)}
                        icon={<Shield className="h-4 w-4" />}
                      >
                        {property.verified ? 'Verificada' : 'Verificar'}
                      </Button>

                      <Button
                        variant={property.featured ? "primary" : "outline"}
                        size="sm"
                        onClick={() => onPropertyAction('feature', property.id, { featured: !property.featured })}
                        icon={<Star className="h-4 w-4" />}
                      >
                        {property.featured ? 'Destacada' : 'Destacar'}
                      </Button>

                      <Button
                        variant={property.hidden ? "primary" : "outline"}
                        size="sm"
                        onClick={() => handleVisibilityToggle(property.id)}
                        icon={property.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      >
                        {property.hidden ? 'Mostrar' : 'Ocultar'}
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(property.id)}
                        icon={<Trash2 className="h-4 w-4" />}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {displayProperties.length === 0 && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No hay propiedades {selectedTab === 'pending' ? 'pendientes' : 'verificadas'}</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">¿Eliminar propiedad?</h3>
            <p className="text-gray-600 mb-6">
              Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta propiedad?
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onPropertyAction('delete', showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};