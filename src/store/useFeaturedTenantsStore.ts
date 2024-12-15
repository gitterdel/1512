import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface FeaturedTenantsState {
  featuredTenants: Record<string, boolean>;
  addFeaturedTenant: (tenantId: string) => void;
  removeFeaturedTenant: (tenantId: string) => void;
  isFeatured: (tenantId: string) => boolean;
  getFeaturedTenants: (users: Record<string, User>) => User[];
}

export const useFeaturedTenantsStore = create<FeaturedTenantsState>()(
  persist(
    (set, get) => ({
      featuredTenants: {
        // Add some default featured tenants for demonstration
        'tenant-1': true,
        'tenant-2': true,
        'tenant-3': true,
        'tenant-4': true
      },

      addFeaturedTenant: (tenantId) => {
        set((state) => ({
          featuredTenants: {
            ...state.featuredTenants,
            [tenantId]: true
          }
        }));
      },

      removeFeaturedTenant: (tenantId) => {
        set((state) => {
          const { [tenantId]: _, ...rest } = state.featuredTenants;
          return { featuredTenants: rest };
        });
      },

      isFeatured: (tenantId) => {
        return !!get().featuredTenants[tenantId];
      },

      getFeaturedTenants: (users) => {
        const featuredIds = Object.keys(get().featuredTenants);
        const validTenants = featuredIds
          .map(id => users[id])
          .filter(user => 
            user && 
            user.role === 'tenant' && 
            user.status === 'active' &&
            user.verified
          )
          .sort((a, b) => {
            // Sort by last login and verification
            if (a.verified !== b.verified) {
              return b.verified ? 1 : -1;
            }
            return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
          })
          .slice(0, 8); // Limit to 8 featured tenants

        return validTenants.length > 0 ? validTenants : [];
      }
    }),
    {
      name: 'featured-tenants-storage',
      version: 1
    }
  )
);