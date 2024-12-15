import { useCallback } from 'react';
import { usePropertyStore } from '../store/usePropertyStore';
import { Property, SearchFilters } from '../types';
import { useAuthStore } from '../store/useAuthStore';

export const useProperties = () => {
  const { user } = useAuthStore();
  const {
    properties,
    filteredProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    setFilteredProperties,
  } = usePropertyStore();

  const myProperties = user
    ? properties.filter(p => p.landlordId === user.id)
    : [];

  const applyFilters = useCallback((filters: SearchFilters) => {
    let filtered = [...properties];

    // Filtrar por ubicación
    if (filters.location) {
      filtered = filtered.filter(
        property => property.location.toLowerCase() === filters.location?.toLowerCase()
      );
    }

    // Filtrar por tipo de propiedad
    if (filters.type !== 'all') {
      filtered = filtered.filter(property => property.type === filters.type);
    }

    // Filtrar por rango de precio
    filtered = filtered.filter(
      property =>
        property.price >= filters.priceRange[0] &&
        property.price <= filters.priceRange[1]
    );

    // Filtrar por características
    if (filters.features.furnished) {
      filtered = filtered.filter(property => property.features.furnished);
    }

    if (filters.features.petsAllowed) {
      filtered = filtered.filter(property => property.features.petsAllowed);
    }

    // Filtrar por fechas disponibles
    if (filters.dates?.startDate && filters.dates?.endDate) {
      filtered = filtered.filter(property => {
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
  }, [properties, setFilteredProperties]);

  return {
    properties,
    filteredProperties,
    myProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    applyFilters,
  };
};