import React from 'react';
import { SearchBox } from './SearchBox';

interface HeroSectionProps {
  selectedComu: string;
  propertyType: string;
  priceRange: string;
  onComuChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onSearch: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = (props) => {
  return (
    <div className="relative min-h-[600px] flex items-center bg-gradient-to-br from-indigo-600 to-purple-800">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover opacity-30"
          src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1920&q=80"
          alt="Background"
          loading="eager"
        />
        <div className="absolute inset-0 bg-indigo-600 mix-blend-multiply" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
            Tu Hogar Ideal en Andorra
          </h1>
          <p className="text-lg md:text-xl text-indigo-100">
            Encuentra el lugar perfecto para vivir en las mejores zonas de Andorra. 
            Casas y habitaciones verificadas con los mejores precios.
          </p>
        </div>

        <SearchBox {...props} />
      </div>
    </div>
  );
};