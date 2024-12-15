import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedPropertiesState {
  savedProperties: Record<string, string[]>; // userId -> propertyIds[]
  toggleSaved: (userId: string, propertyId: string) => void;
  isSaved: (userId: string, propertyId: string) => boolean;
  getSavedProperties: (userId: string) => string[];
}

export const useSavedPropertiesStore = create<SavedPropertiesState>()(
  persist(
    (set, get) => ({
      savedProperties: {},

      toggleSaved: (userId, propertyId) => {
        set((state) => {
          const userSaved = state.savedProperties[userId] || [];
          const isCurrentlySaved = userSaved.includes(propertyId);

          return {
            savedProperties: {
              ...state.savedProperties,
              [userId]: isCurrentlySaved
                ? userSaved.filter(id => id !== propertyId)
                : [...userSaved, propertyId]
            }
          };
        });
      },

      isSaved: (userId, propertyId) => {
        const state = get();
        return (state.savedProperties[userId] || []).includes(propertyId);
      },

      getSavedProperties: (userId) => {
        return get().savedProperties[userId] || [];
      },
    }),
    {
      name: 'saved-properties-storage',
    }
  )
);