import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../types/database';

export const useDatabase = () => {
  const handleError = (error: any) => {
    console.error('Database error:', error);
    toast.error('Error en la base de datos');
    throw error;
  };

  const getUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  const getProperties = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*');
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  const createProperty = useCallback(async (propertyData: Database['public']['Tables']['properties']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([propertyData])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Propiedad creada exitosamente');
      return data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  const updateProperty = useCallback(async (id: string, updates: Database['public']['Tables']['properties']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Propiedad actualizada exitosamente');
      return data;
    } catch (error) {
      handleError(error);
    }
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Propiedad eliminada exitosamente');
    } catch (error) {
      handleError(error);
    }
  }, []);

  const saveProperty = useCallback(async (userId: string, propertyId: string) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .insert([{ user_id: userId, property_id: propertyId }]);
      
      if (error) throw error;
      toast.success('Propiedad guardada');
    } catch (error) {
      handleError(error);
    }
  }, []);

  const unsaveProperty = useCallback(async (userId: string, propertyId: string) => {
    try {
      const { error } = await supabase
        .from('saved_properties')
        .delete()
        .match({ user_id: userId, property_id: propertyId });
      
      if (error) throw error;
      toast.success('Propiedad eliminada de guardados');
    } catch (error) {
      handleError(error);
    }
  }, []);

  return {
    getUsers,
    getProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    saveProperty,
    unsaveProperty
  };
};