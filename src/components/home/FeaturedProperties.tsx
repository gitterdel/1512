import React from 'react';
import { Star, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import { Property } from '../../types';
import { PropertyCard } from '../PropertyCard';
import { Link } from 'react-router-dom';

interface FeaturedPropertiesProps {
  properties: Property[];
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({ properties }) => {
  if (!properties.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Content */}
        <div className="relative">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            {/* Left Side - Badges */}
            <div className="flex items-center space-x-4 mb-6 md:mb-0">
              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <div className="flex items-center text-green-700">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Mejor Valoradas</span>
                </div>
              </div>

              <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg">
                <div className="flex items-center text-indigo-700">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Verificadas</span>
                </div>
              </div>
            </div>

            {/* Right Side - Search Link */}
            <Link 
              to="/search" 
              className="group flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span className="font-medium mr-2">Ver todas las propiedades</span>
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};