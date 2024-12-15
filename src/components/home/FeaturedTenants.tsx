import React from 'react';
import { Star, Shield, CheckCircle } from 'lucide-react';
import { FeaturedTenantCard } from '../tenant/FeaturedTenantCard';
import { useAuthStore } from '../../store/useAuthStore';
import { useFeaturedTenantsStore } from '../../store/useFeaturedTenantsStore';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const FeaturedTenants = () => {
  const { registeredUsers } = useAuthStore();
  const { getFeaturedTenants } = useFeaturedTenantsStore();

  // Get featured tenants from the store
  const featuredTenants = getFeaturedTenants(registeredUsers);

  if (!featuredTenants || featuredTenants.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Content */}
        <div className="relative">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            {/* Title and Description */}
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inquilinos Destacados</h2>
              <p className="text-gray-600">Conoce a nuestros inquilinos más activos y mejor valorados</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4">
              <div className="bg-purple-50 border border-purple-200 px-4 py-2 rounded-lg">
                <div className="flex items-center text-purple-700">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Mejor Valorados</span>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                <div className="flex items-center text-green-700">
                  <Shield className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Verificados</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tenants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTenants.map((tenant) => (
              <FeaturedTenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>

          {/* View All Button */}
          <div className="mt-8 text-center">
            <Link to="/search?type=tenant">
              <Button
                variant="outline"
                className="px-8"
              >
                Ver todos los inquilinos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};