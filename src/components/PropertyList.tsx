import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Clock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import { Button } from './ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import { PropertyStatusBadge } from './PropertyStatusBadge';
import { formatPrice } from '../utils/format';
import { DEFAULT_PROPERTY_IMAGES, getValidImageUrl } from '../utils/images';

export const PropertyList = ({ properties }: { properties: any[] }) => {
  const navigate = useNavigate();
  const { updateProperty, deleteProperty } = useProperties();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<string | null>(null);

  const handleEdit = (propertyId: string) => {
    navigate(`/landlord/properties/edit/${propertyId}`);
  };

  const handleDelete = async (propertyId: string) => {
    try {
      await deleteProperty(propertyId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  const handleStatusChange = async (propertyId: string, status: 'available' | 'reserved' | 'rented') => {
    try {
      await updateProperty(propertyId, { status });
    } catch (error) {
      console.error('Error updating property status:', error);
    }
  };

  const handleVisibilityToggle = async (propertyId: string, hidden: boolean) => {
    try {
      await updateProperty(propertyId, { hidden });
    } catch (error) {
      console.error('Error updating property visibility:', error);
    }
  };

  if (!properties.length) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay propiedades publicadas</h3>
        <p className="text-gray-500 mb-6">Comienza publicando tu primera propiedad</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {properties.map((property) => (
        <div key={property.id} className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Imagen principal */}
            <div className="md:w-48 h-48">
              <img
                src={getValidImageUrl(property.images[0], DEFAULT_PROPERTY_IMAGES[0])}
                alt={property.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Información de la propiedad */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{property.title}</h3>
                  <p className="text-gray-500">{property.location}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <PropertyStatusBadge status={property.status} verified={property.verified} />
                    {property.hidden && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="h-3 w-3 mr-1" />
                        Oculta
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xl font-semibold text-indigo-600">{formatPrice(property.price)}/mes</p>
              </div>

              {/* Controles */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={property.status}
                  onChange={(e) => handleStatusChange(property.id, e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="available">Disponible</option>
                  <option value="reserved">Reservada</option>
                  <option value="rented">Alquilada</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVisibilityToggle(property.id, !property.hidden)}
                  icon={property.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                >
                  {property.hidden ? 'Mostrar' : 'Ocultar'}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(property.id)}
                  icon={<Edit className="h-4 w-4" />}
                >
                  Editar
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
      ))}

      {/* Modal de confirmación de eliminación */}
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
                onClick={() => handleDelete(showDeleteConfirm)}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}