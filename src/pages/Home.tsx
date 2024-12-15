import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../store/usePropertyStore';
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedProperties } from '../components/home/FeaturedProperties';
import { FeaturedTenants } from '../components/home/FeaturedTenants';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const Home = () => {
  const navigate = useNavigate();
  const { properties, isLoading, fetchProperties } = usePropertyStore();
  const [selectedComu, setSelectedComu] = useState('');
  const [propertyType, setPropertyType] = useState('all');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      try {
        await fetchProperties();
      } catch (error) {
        console.error('Error loading properties:', error);
      }
    };

    loadProperties();
  }, [fetchProperties]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedComu) params.append('location', selectedComu);
    if (propertyType !== 'all') params.append('type', propertyType);
    if (priceRange) params.append('price', priceRange);
    navigate(`/search?${params.toString()}`);
  };

  // Filter and sort featured properties
  const featuredProperties = properties
    .filter(p => p && p.status === 'available' && p.verified && !p.hidden)
    .sort((a, b) => {
      // Priorizar propiedades destacadas
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      // Luego por fecha de creación
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        {/* Hero Section */}
        <HeroSection
          selectedComu={selectedComu}
          propertyType={propertyType}
          priceRange={priceRange}
          onComuChange={setSelectedComu}
          onTypeChange={setPropertyType}
          onPriceChange={setPriceRange}
          onSearch={handleSearch}
        />

        {/* Featured Properties */}
        <FeaturedProperties properties={featuredProperties} />

        {/* Features Section */}
        <FeaturesSection />

        {/* Featured Tenants */}
        <FeaturedTenants />

        {/* Stats Section */}
        <StatsSection totalProperties={properties.length} />
      </main>
    </div>
  );
};