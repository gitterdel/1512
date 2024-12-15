import { supabase } from './supabase';

export const setupDatabase = async () => {
  try {
    // Create tables
    const { error: setupError } = await supabase.rpc('exec', {
      query: `
        -- Enable extensions
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";

        -- Create properties table
        CREATE TABLE IF NOT EXISTS public.properties (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL,
          location TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('house', 'room')),
          landlord_id UUID REFERENCES auth.users(id),
          images TEXT[] NOT NULL DEFAULT '{}',
          features JSONB NOT NULL DEFAULT '{}',
          amenities TEXT[] DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          verified BOOLEAN DEFAULT false,
          verified_at TIMESTAMPTZ,
          hidden BOOLEAN DEFAULT false,
          views INTEGER DEFAULT 0,
          rating NUMERIC
        );

        -- Enable RLS
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Enable read access for all users"
          ON public.properties
          FOR SELECT
          USING (true);

        CREATE POLICY "Enable insert for authenticated users"
          ON public.properties
          FOR INSERT
          WITH CHECK (auth.uid() = landlord_id);

        CREATE POLICY "Enable update for property owners"
          ON public.properties
          FOR UPDATE
          USING (auth.uid() = landlord_id);

        CREATE POLICY "Enable delete for property owners"
          ON public.properties
          FOR DELETE
          USING (auth.uid() = landlord_id);

        -- Insert sample properties
        INSERT INTO public.properties (
          title,
          description,
          price,
          location,
          type,
          landlord_id,
          images,
          features,
          status
        ) VALUES
        (
          'Apartamento moderno en Andorra la Vella',
          'Hermoso apartamento con vistas a la montaña',
          1500,
          'Andorra la Vella',
          'house',
          auth.uid(),
          ARRAY['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267'],
          '{"bedrooms": 2, "bathrooms": 1, "size": 75, "furnished": true, "petsAllowed": false}'::jsonb,
          'available'
        ),
        (
          'Habitación en Santa Coloma',
          'Habitación individual en piso compartido',
          600,
          'Santa Coloma',
          'room',
          auth.uid(),
          ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'],
          '{"bedrooms": 1, "bathrooms": 1, "furnished": true, "petsAllowed": true}'::jsonb,
          'available'
        );
      `
    });

    if (setupError) {
      console.error('Error setting up database:', setupError);
      throw setupError;
    }

    console.log('Database setup completed successfully');
    return true;
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  }
};