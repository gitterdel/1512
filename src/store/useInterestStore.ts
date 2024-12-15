import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TenantInterest } from '../types';

interface InterestState {
  interests: TenantInterest[];
  addInterest: (interest: Omit<TenantInterest, 'id' | 'createdAt' | 'status'>) => void;
  updateInterestStatus: (interestId: string, status: 'approved' | 'rejected', notes?: string) => void;
  getInterestsForProperty: (propertyId: string) => TenantInterest[];
  getInterestsForLandlord: (landlordId: string) => TenantInterest[];
  getInterestsFromTenant: (tenantId: string) => TenantInterest[];
}

export const useInterestStore = create<InterestState>()(
  persist(
    (set, get) => ({
      interests: [],
      
      addInterest: (interestData) => {
        const newInterest: TenantInterest = {
          ...interestData,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          createdAt: new Date(),
        };

        set((state) => ({
          interests: [...state.interests, newInterest],
        }));
      },

      updateInterestStatus: (interestId, status, notes) => {
        set((state) => ({
          interests: state.interests.map((interest) =>
            interest.id === interestId
              ? {
                  ...interest,
                  status,
                  landlordNotes: notes,
                  reviewedAt: new Date(),
                }
              : interest
          ),
        }));
      },

      getInterestsForProperty: (propertyId) => {
        return get().interests.filter((interest) => interest.propertyId === propertyId);
      },

      getInterestsForLandlord: (landlordId) => {
        return get().interests.filter((interest) => interest.landlordId === landlordId);
      },

      getInterestsFromTenant: (tenantId) => {
        return get().interests.filter((interest) => interest.tenantId === tenantId);
      },
    }),
    {
      name: 'interest-storage',
    }
  )
);