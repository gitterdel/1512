import React from 'react';
import { Property } from '../../types';
import { Shield, AlertTriangle, Check, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';

interface PropertyVerificationListProps {
  properties: Property[];
  onVerify: (propertyId: string) => void;
  onReject: (propertyId: string) => void;
}

export const PropertyVerificationList: React.FC<PropertyVerificationListProps> = ({
  properties,
  onVerify,
  onReject
}) => {
  if (properties.length === 0) {
    return (
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center">
          <Check className="h-5 w-5 text-green-400 mr-2" />
          <p className="text-green-700">Todas las propiedades han sido verificadas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div key={property.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-start justify-between">
            <div className="flex space-x-4">
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-24 h-24 rounded-md object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-lg">{property.title}</h3>
                  <Link 
                    to={`/property/${property.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
                <p className="text-gray-500">{property.location}</p>
                <p className="text-indigo-600 font-medium">{formatPrice(property.price)}/mes</p>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
                  Pendiente de verificación
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onVerify(property.id)}
                icon={<Shield className="h-4 w-4" />}
                className="text-green-600 hover:bg-green-50"
              >
                Aprobar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReject(property.id)}
                icon={<X className="h-4 w-4" />}
                className="text-red-600 hover:bg-red-50"
              >
                Rechazar
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};