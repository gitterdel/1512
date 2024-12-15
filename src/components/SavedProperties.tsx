import React from 'react';
import { Bookmark } from 'lucide-react';
import { PropertyCard } from './PropertyCard';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { useSavedPropertiesStore } from '../store/useSavedPropertiesStore';

export const SavedProperties = () => {
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();
  const { getSavedProperties } = useSavedPropertiesStore();

  if (!user) return null;

  const savedPropertyIds = getSavedProperties(user.id);
  const savedProperties = properties.filter(property => 
    savedPropertyIds.includes(property.id)
  );

  if (savedProperties.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <Bookmark className="h-5 w-5 mr-2" />
            Propiedades Guardadas
          </h2>
        </div>
        <div className="text-center text-gray-500 py-8">
          <p>No tienes propiedades guardadas</p>
          <p className="text-sm mt-2">Las propiedades que guardes aparecerán aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <Bookmark className="h-5 w-5 mr-2" />
          Propiedades Guardadas ({savedProperties.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};