import React from 'react';
import { Property } from '../../types';
import { formatPrice } from '../../utils/format';
import { ExternalLink } from 'lucide-react';

interface PropertyPreviewProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyPreview: React.FC<PropertyPreviewProps> = ({ property, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg transition-colors w-full group"
    >
      <img
        src={property.images[0]}
        alt={property.title}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
          <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <p className="text-sm text-gray-500">
          {formatPrice(property.price)}/mes · {property.location}
        </p>
      </div>
    </button>
  );
};