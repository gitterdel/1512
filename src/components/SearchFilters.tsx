import React from 'react';
import { Sliders } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

const comus = [
  'Andorra la Vella',
  'Santa Coloma',
  'La Margineda',
  'Escaldes-Engordany'
];

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({ filters, onFilterChange }) => {
  const handleChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : undefined;
    handleChange('dates', {
      ...filters.dates,
      [type]: date
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center">
          <Sliders className="h-5 w-5 mr-2" />
          Filtros de Búsqueda
        </h2>
        <button
          onClick={() => onFilterChange({
            priceRange: [0, 5000],
            type: 'all',
            amenities: [],
            features: {},
            sortBy: 'price',
            dates: undefined,
            location: ''
          } as SearchFiltersType)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="space-y-6">
        {/* Ubicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comunidad
          </label>
          <select
            value={filters.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Todas las comunidades</option>
            {comus.map((comu) => (
              <option key={comu} value={comu}>
                {comu}
              </option>
            ))}
          </select>
        </div>

        {/* Fechas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fechas
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="date"
                value={filters.dates?.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="date"
                value={filters.dates?.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min={filters.dates?.startDate?.toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Rango de Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Precio
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              value={filters.priceRange[0]}
              onChange={(e) =>
                handleChange('priceRange', [
                  Number(e.target.value),
                  filters.priceRange[1],
                ])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Mín"
            />
            <span>-</span>
            <input
              type="number"
              value={filters.priceRange[1]}
              onChange={(e) =>
                handleChange('priceRange', [
                  filters.priceRange[0],
                  Number(e.target.value),
                ])
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Máx"
            />
          </div>
        </div>

        {/* Tipo de Propiedad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Propiedad
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">Todos</option>
            <option value="room">Habitación</option>
            <option value="house">Casa</option>
          </select>
        </div>

        {/* Características */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Características
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.features.furnished}
                onChange={(e) =>
                  handleChange('features', {
                    ...filters.features,
                    furnished: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Amueblado</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.features.petsAllowed}
                onChange={(e) =>
                  handleChange('features', {
                    ...filters.features,
                    petsAllowed: e.target.checked,
                  })
                }
                className="rounded border-gray-300 text-indigo-600"
              />
              <span className="ml-2 text-sm text-gray-600">Mascotas Permitidas</span>
            </label>
          </div>
        </div>

        {/* Ordenar Por */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar Por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="price">Precio</option>
            <option value="rating">Calificación</option>
            <option value="newest">Más Recientes</option>
          </select>
        </div>
      </div>
    </div>
  );
};