import React from 'react';
import { Search, MapPin, Home as HomeIcon, DollarSign } from 'lucide-react';

interface HeroSearchProps {
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
  'Santa Coloma',
  'La Margineda',
  'Escaldes-Engordany'
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  selectedComu,
  propertyType,
  priceRange,
  onComuChange,
  onTypeChange,
  onPriceChange,
  onSearch
}) => {
  return (
    <div className="relative min-h-[600px] md:min-h-[500px] flex items-center bg-gradient-to-br from-indigo-600 to-purple-800">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          alt="Background"
        />
        <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply" />
      </div>

      {/* Content Container */}
      <div className="relative w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Hero Text */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
              Tu Hogar Ideal en Andorra
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
              Encuentra el lugar perfecto para vivir en las mejores zonas de Andorra. 
              Casas y habitaciones verificadas con los mejores precios.
            </p>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 backdrop-blur-lg bg-opacity-95">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Location */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                    {comus.map((comu) => (
                      <option key={comu} value={comu}>{comu}</option>
                    ))}
                  </select>
                </div>

                {/* Property Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
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

              {/* Search Button */}
              <div className="mt-6">
                <button
                  onClick={onSearch}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 md:py-4 px-6 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium text-base md:text-lg shadow-lg hover:shadow-xl"
                >
                  <Search className="h-5 w-5" />
                  <span>Buscar Propiedades</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};