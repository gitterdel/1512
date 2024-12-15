import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { usePropertyStore } from '../store/usePropertyStore';
import { useSavedPropertiesStore } from '../store/useSavedPropertiesStore';
import { PropertyCard } from '../components/PropertyCard';
import { Bookmark, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const SavedPropertiesPage = () => {
  const { user } = useAuthStore();
  const { properties } = usePropertyStore();
  const { getSavedProperties } = useSavedPropertiesStore();

  if (!user) {
    return <LoadingSpinner />;
  }

  const savedPropertyIds = getSavedProperties(user.id);
  const savedProperties = properties.filter(property => 
    savedPropertyIds.includes(property.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Bookmark className="h-6 w-6 mr-2" />
            Propiedades Guardadas
          </h1>
          <p className="text-gray-600 mt-1">
            {savedProperties.length} {savedProperties.length === 1 ? 'propiedad guardada' : 'propiedades guardadas'}
          </p>
        </div>

        <Link
          to="/search"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Search className="h-5 w-5 mr-2" />
          Buscar Propiedades
        </Link>
      </div>

      {savedProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Bookmark className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No hay propiedades guardadas</h2>
          <p className="text-gray-600 mb-6">
            Guarda las propiedades que te interesen para acceder a ellas fácilmente más tarde
          </p>
          <Link
            to="/search"
            className="inline-flex items-center bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Search className="h-5 w-5 mr-2" />
            Explorar Propiedades
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
};