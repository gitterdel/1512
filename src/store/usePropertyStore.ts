import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Property } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { produce } from 'immer';

interface PropertyState {
  properties: Property[];
  filteredProperties: Property[];
  isLoading: boolean;
  error: string | null;
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id' | 'createdAt'>) => Promise<void>;
  setFilteredProperties: (properties: Property[]) => void;
  updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<void>;
  deleteProperty: (propertyId: string) => Promise<void>;
  toggleFeatured: (propertyId: string) => Promise<void>;
  toggleVisibility: (propertyId: string) => Promise<void>;
  reset: () => void;
}

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: [],
      filteredProperties: [],
      isLoading: false,
      error: null,

      fetchProperties: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (!data) {
            throw new Error('No se recibieron datos');
          }

          const properties = data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            price: item.price,
            location: item.location,
            type: item.type,
            landlordId: item.landlord_id,
            images: Array.isArray(item.images) ? item.images : [],
            features: typeof item.features === 'string' ? JSON.parse(item.features) : item.features || {},
            status: item.status || 'available',
            createdAt: new Date(item.created_at),
            verified: item.verified || false,
            featured: item.featured || false,
            rating: item.rating || 0,
            hidden: item.hidden || false
          }));

          set({ 
            properties,
            filteredProperties: properties,
            isLoading: false 
          });
        } catch (error) {
          console.error('Error fetching properties:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Error al cargar las propiedades',
            isLoading: false 
          });
          toast.error('Error al cargar las propiedades');
        }
      },

      addProperty: async (propertyData) => {
        try {
          set({ isLoading: true, error: null });

          const { data, error } = await supabase
            .from('properties')
            .insert([{
              title: propertyData.title,
              description: propertyData.description,
              price: propertyData.price,
              location: propertyData.location,
              type: propertyData.type,
              landlord_id: propertyData.landlordId,
              images: propertyData.images,
              features: propertyData.features,
              status: propertyData.status || 'available',
              verified: false,
              featured: false,
              hidden: false
            }])
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('No se pudo crear la propiedad');

          const newProperty: Property = {
            id: data.id,
            title: data.title,
            description: data.description,
            price: data.price,
            location: data.location,
            type: data.type,
            landlordId: data.landlord_id,
            images: data.images,
            features: data.features,
            status: data.status,
            createdAt: new Date(data.created_at),
            verified: data.verified,
            featured: data.featured,
            rating: 0,
            hidden: false
          };

          set(produce(state => {
            state.properties.unshift(newProperty);
            state.filteredProperties.unshift(newProperty);
          }));

          toast.success('Propiedad creada correctamente');
        } catch (error) {
          console.error('Error creating property:', error);
          set({ isLoading: false });
          toast.error('Error al crear la propiedad');
          throw error;
        }
      },

      updateProperty: async (propertyId, updates) => {
        try {
          const { error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', propertyId);

          if (error) throw error;

          set(produce(state => {
            const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex !== -1) {
              state.properties[propertyIndex] = {
                ...state.properties[propertyIndex],
                ...updates
              };
            }

            const filteredIndex = state.filteredProperties.findIndex(p => p.id === propertyId);
            if (filteredIndex !== -1) {
              state.filteredProperties[filteredIndex] = {
                ...state.filteredProperties[filteredIndex],
                ...updates
              };
            }
          }));

          toast.success('Propiedad actualizada correctamente');
        } catch (error) {
          console.error('Error updating property:', error);
          toast.error('Error al actualizar la propiedad');
          throw error;
        }
      },

      toggleFeatured: async (propertyId) => {
        try {
          const property = get().properties.find(p => p.id === propertyId);
          if (!property) throw new Error('Propiedad no encontrada');

          const { error } = await supabase
            .from('properties')
            .update({ featured: !property.featured })
            .eq('id', propertyId);

          if (error) throw error;

          set(produce(state => {
            const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex !== -1) {
              state.properties[propertyIndex].featured = !property.featured;
            }

            const filteredIndex = state.filteredProperties.findIndex(p => p.id === propertyId);
            if (filteredIndex !== -1) {
              state.filteredProperties[filteredIndex].featured = !property.featured;
            }
          }));

          toast.success(property.featured ? 'Propiedad quitada de destacados' : 'Propiedad destacada correctamente');
        } catch (error) {
          console.error('Error toggling featured property:', error);
          toast.error('Error al actualizar la propiedad');
          throw error;
        }
      },

      toggleVisibility: async (propertyId) => {
        try {
          const property = get().properties.find(p => p.id === propertyId);
          if (!property) throw new Error('Propiedad no encontrada');

          const { error } = await supabase
            .from('properties')
            .update({ hidden: !property.hidden })
            .eq('id', propertyId);

          if (error) throw error;

          set(produce(state => {
            const propertyIndex = state.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex !== -1) {
              state.properties[propertyIndex].hidden = !property.hidden;
            }

            const filteredIndex = state.filteredProperties.findIndex(p => p.id === propertyId);
            if (filteredIndex !== -1) {
              state.filteredProperties[filteredIndex].hidden = !property.hidden;
            }
          }));

          toast.success(property.hidden ? 'Propiedad visible' : 'Propiedad oculta');
        } catch (error) {
          console.error('Error toggling property visibility:', error);
          toast.error('Error al cambiar la visibilidad de la propiedad');
          throw error;
        }
      },

      deleteProperty: async (propertyId) => {
        try {
          const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', propertyId);

          if (error) throw error;

          set(produce(state => {
            state.properties = state.properties.filter(p => p.id !== propertyId);
            state.filteredProperties = state.filteredProperties.filter(p => p.id !== propertyId);
          }));

          toast.success('Propiedad eliminada correctamente');
        } catch (error) {
          console.error('Error deleting property:', error);
          toast.error('Error al eliminar la propiedad');
          throw error;
        }
      },

      setFilteredProperties: (properties) => {
        set({ filteredProperties: properties });
      },

      reset: () => {
        set({
          properties: [],
          filteredProperties: [],
          isLoading: false,
          error: null
        });
      }
    }),
    {
      name: 'property-storage',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      partialize: (state) => ({
        properties: state.properties,
        filteredProperties: state.filteredProperties
      }),
      version: 1
    }
  )
);