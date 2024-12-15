import React from 'react';
import { MapPin, Home as HomeIcon, DollarSign, Search } from 'lucide-react';
import { Button } from '../ui/Button';

interface SearchBoxProps {
  selectedComu: string;
  propertyType: string;
  priceRange: string;
  onComuChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSearch: () => void;
}

const comus = [
  'Andorra la Vella',
  'Escaldes-Engordany',
  'La Massana',
  'Encamp',
  'Canillo',
  'Ordino',
  'Sant Julià de Lòria'
];

export const SearchBox: React.FC<SearchBoxProps> = ({
  selectedComu,
  propertyType,
  priceRange,
  onComuChange,
  onTypeChange,
  onPriceChange,
  onSearch
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 backdrop-blur-lg bg-opacity-95">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
                <span>Ubicación</span>
              </div>
            </label>
            <select
              value={selectedComu}
              onChange={(e) => onComuChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Todas las ubicaciones</option>
              {comus.map(comu => (
                <option key={comu} value={comu}>{comu}</option>
              ))}
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-2">
                <HomeIcon className="h-4 w-4 text-indigo-600" />
                <span>Tipo de Propiedad</span>
              </div>
            </label>
            <select
              value={propertyType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="all">Todos los tipos</option>
              <option value="house">Casa completa</option>
              <option value="room">Habitación</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-indigo-600" />
                <span>Presupuesto Máximo</span>
              </div>
            </label>
            <select
              value={priceRange}
              onChange={(e) => onPriceChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            >
              <option value="">Sin límite</option>
              <option value="1000">Hasta 1.000€</option>
              <option value="2000">Hasta 2.000€</option>
              <option value="3000">Hasta 3.000€</option>
              <option value="4000">Hasta 4.000€</option>
              <option value="5000">Hasta 5.000€</option>
            </select>
          </div>
        </div>

        <Button
          onClick={onSearch}
          variant="primary"
          className="w-full mt-6"
          size="lg"
          icon={<Search className="h-5 w-5" />}
        >
          Buscar Propiedades
        </Button>
      </div>
    </div>
  );
};