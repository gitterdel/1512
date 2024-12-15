import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchFiltersComponent } from '../components/SearchFilters';
import { PropertyCard } from '../components/PropertyCard';
import { Property, SearchFilters } from '../types';
import { usePropertyStore } from '../store/usePropertyStore';

const initialFilters: SearchFilters = {
  priceRange: [0, 5000],
  type: 'all',
  amenities: [],
  features: {
    furnished: false,
    petsAllowed: false,
  },
  sortBy: 'price',
  location: '',
  dates: undefined,
};

export const PropertySearch = () => {
  const location = useLocation();
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const { properties, setFilteredProperties, filteredProperties } = usePropertyStore();

  // Procesar parámetros de búsqueda de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const locationParam = params.get('location');

    const newFilters = { ...initialFilters };

    if (startDate && endDate) {
      newFilters.dates = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };
    }

    if (locationParam) {
      newFilters.location = locationParam;
    }

    setFilters(newFilters);
  }, [location.search]);

  // Aplicar filtros cuando cambien los properties o los filtros
  useEffect(() => {
    let filtered = [...properties];

    // Filtrar por ubicación
    if (filters.location) {
      filtered = filtered.filter(
        (property) => property.location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Filtrar por tipo de propiedad
    if (filters.type !== 'all') {
      filtered = filtered.filter((property) => property.type === filters.type);
    }

    // Filtrar por rango de precio
    filtered = filtered.filter(
      (property) =>
        property.price >= filters.priceRange[0] &&
        property.price <= filters.priceRange[1]
    );

    // Filtrar por características
    if (filters.features.furnished) {
      filtered = filtered.filter((property) => property.features.furnished);
    }

    if (filters.features.petsAllowed) {
      filtered = filtered.filter((property) => property.features.petsAllowed);
    }

    // Filtrar por fechas disponibles
    if (filters.dates?.startDate && filters.dates?.endDate) {
      filtered = filtered.filter((property) => {
        if (!property.unavailableDates) return true;
        
        const isUnavailable = property.unavailableDates.some(date => {
          const unavailableDate = new Date(date);
          return unavailableDate >= filters.dates!.startDate && 
                 unavailableDate <= filters.dates!.endDate;
        });
        return !isUnavailable;
      });
    }

    // Ordenar resultados
    switch (filters.sortBy) {
      case 'price':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setFilteredProperties(filtered);
  }, [filters, properties, setFilteredProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Buscar Propiedades</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <SearchFiltersComponent filters={filters} onFilterChange={setFilters} />
        </div>
        <div className="md:col-span-3">
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500">No se encontraron propiedades con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};