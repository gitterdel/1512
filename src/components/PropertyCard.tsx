import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home as HomeIcon, Bath, BedDouble, Shield } from 'lucide-react';
import { Property } from '../types';
import { formatPrice } from '../utils/format';

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="aspect-[4/3] relative">
        <img
          src={property.images[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            property.status === 'available' 
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {property.status === 'available' ? 'Disponible' : 'Reservado'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{property.title}</h3>
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-indigo-600">{formatPrice(property.price)}</p>
            <p className="text-xs text-gray-500">por mes</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
          <div className="flex items-center">
            <HomeIcon className="h-4 w-4 mr-1" />
            <span>{property.type === 'house' ? 'Casa' : 'Habitación'}</span>
          </div>
          {property.features?.bathrooms && (
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.features.bathrooms} baños</span>
            </div>
          )}
          {property.features?.bedrooms && (
            <div className="flex items-center">
              <BedDouble className="h-4 w-4 mr-1" />
              <span>{property.features.bedrooms} hab.</span>
            </div>
          )}
        </div>

        {property.verified && (
          <div className="flex items-center text-green-600 text-sm">
            <Shield className="h-4 w-4 mr-1" />
            <span>Verificada</span>
          </div>
        )}
      </div>
    </div>
  );
};