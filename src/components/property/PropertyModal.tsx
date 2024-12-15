import React from 'react';
import { X } from 'lucide-react';
import { Property } from '../../types';
import { PropertyDetails } from '../PropertyDetails';
import { Button } from '../ui/Button';

interface PropertyModalProps {
  property: Property;
  onClose: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Detalles de la Propiedad</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          <PropertyDetails property={property} />
        </div>
      </div>
    </div>
  );
};