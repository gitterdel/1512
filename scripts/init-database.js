import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxvcwxteuwjtvgweslhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmN3eHRldXdqdHZnd2VzbGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDcwNDMsImV4cCI6MjA0NzQyMzA0M30.x1sfV1hJQCyNfpuU4QmJS7zWxio1sFGreiq7yFdkZZA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Create exec_sql function
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql_query: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;

        GRANT EXECUTE ON FUNCTION exec_sql(text) TO authenticated;
        GRANT EXECUTE ON FUNCTION exec_sql(text) TO anon;
      `
    });

    if (funcError && !funcError.message.includes('already exists')) {
      throw funcError;
    }

    // Create tables
    const { error: tablesError } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Drop existing tables
        DROP TABLE IF EXISTS public.messages CASCADE;
        DROP TABLE IF EXISTS public.chats CASCADE;
        DROP TABLE IF EXISTS public.reviews CASCADE;
        DROP TABLE IF EXISTS public.saved_properties CASCADE;
        DROP TABLE IF EXISTS public.properties CASCADE;
        DROP TABLE IF EXISTS public.users CASCADE;

        -- Create users table
        CREATE TABLE public.users (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('tenant', 'landlord', 'admin')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
          verified BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_login TIMESTAMPTZ DEFAULT NOW(),
          avatar_url TEXT,
          phone TEXT,
          location TEXT,
          date_of_birth DATE,
          bio TEXT,
          verified_at TIMESTAMPTZ,
          tenant_info JSONB DEFAULT '{}'::jsonb
        );

        -- Create properties table
        CREATE TABLE public.properties (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          price NUMERIC NOT NULL CHECK (price >= 100 AND price <= 10000),
          location TEXT NOT NULL,
          type TEXT NOT NULL CHECK (type IN ('house', 'room')),
          landlord_id UUID REFERENCES public.users(id),
          images TEXT[] NOT NULL DEFAULT '{}',
          features JSONB NOT NULL DEFAULT '{}',
          amenities TEXT[] DEFAULT '{}',
          status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'rented')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          verified BOOLEAN DEFAULT false,
          verified_at TIMESTAMPTZ,
          hidden BOOLEAN DEFAULT false,
          views INTEGER DEFAULT 0,
          rating NUMERIC DEFAULT 0,
          featured BOOLEAN DEFAULT false
        );

        -- Create chats table
        CREATE TABLE public.chats (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          participants UUID[] NOT NULL,
          property_id UUID REFERENCES public.properties(id),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          last_message JSONB,
          CONSTRAINT valid_participants CHECK (array_length(participants, 1) >= 2)
        );

        -- Create messages table
        CREATE TABLE public.messages (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES public.users(id),
          receiver_id UUID REFERENCES public.users(id),
          content TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'message' CHECK (type IN ('message', 'rental_request', 'rental_response')),
          read BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          property_id UUID REFERENCES public.properties(id),
          metadata JSONB
        );

        -- Create saved_properties table
        CREATE TABLE public.saved_properties (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, property_id)
        );

        -- Create reviews table
        CREATE TABLE public.reviews (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          rating INTEGER CHECK (rating >= 1 AND rating <= 5),
          comment TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ,
          UNIQUE(property_id, user_id)
        );

        -- Enable RLS
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_properties_landlord ON public.properties(landlord_id);
        CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
        CREATE INDEX IF NOT EXISTS idx_chats_participants ON public.chats USING GIN (participants);
        CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_id);
        CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
        CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
        CREATE INDEX IF NOT EXISTS idx_saved_properties_user ON public.saved_properties(user_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_property ON public.reviews(property_id);

        -- Create RLS policies
        CREATE POLICY "Enable read access for all users"
          ON public.users FOR SELECT
          USING (true);

        CREATE POLICY "Enable insert for authenticated users"
          ON public.users FOR INSERT
          WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Enable update for own profile"
          ON public.users FOR UPDATE
          USING (auth.uid() = id);

        CREATE POLICY "Enable read access for all properties"
          ON public.properties FOR SELECT
          USING (true);

        CREATE POLICY "Enable insert for landlords"
          ON public.properties FOR INSERT
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.users
              WHERE id = auth.uid() AND role IN ('landlord', 'admin')
            )
          );

        CREATE POLICY "Enable chat access for participants"
          ON public.chats FOR ALL
          USING (
            auth.uid() = ANY(participants) OR
            EXISTS (
              SELECT 1 FROM public.users
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        CREATE POLICY "Enable message access for chat participants"
          ON public.messages FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM public.chats
              WHERE id = chat_id AND (
                auth.uid() = ANY(participants) OR
                EXISTS (
                  SELECT 1 FROM public.users
                  WHERE id = auth.uid() AND role = 'admin'
                )
              )
            )
          );
      `
    });

    if (tablesError) throw tablesError;

    // Create admin user
    console.log('Creating admin user...');
    const { data: adminData, error: adminError } = await supabase.auth.signUp({
      email: 'admin@renthub.com',
      password: 'Admin123!',
      options: {
        data: {
          name: 'Administrador',
          role: 'admin'
        }
      }
    });

    if (!adminError || adminError.message.includes('already registered')) {
      await supabase
        .from('users')
        .upsert([{
          id: adminData?.user?.id,
          email: 'admin@renthub.com',
          name: 'Administrador',
          role: 'admin',
          status: 'active',
          verified: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          verified_at: new Date().toISOString()
        }], {
          onConflict: 'email'
        });
    }

    // Create landlord user
    console.log('Creating landlord user...');
    const { data: landlordData, error: landlordError } = await supabase.auth.signUp({
      email: 'landlord@example.com',
      password: 'Landlord123!',
      options: {
        data: {
          name: 'Juan Propietario',
          role: 'landlord'
        }
      }
    });

    if (!landlordError || landlordError.message.includes('already registered')) {
      const { data: landlordUser } = await supabase
        .from('users')
        .upsert([{
          id: landlordData?.user?.id,
          email: 'landlord@example.com',
          name: 'Juan Propietario',
          role: 'landlord',
          status: 'active',
          verified: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          verified_at: new Date().toISOString()
        }], {
          onConflict: 'email'
        })
        .select()
        .single();

      // Create properties
      if (landlordUser?.data) {
        await supabase
          .from('properties')
          .upsert([
            {
              title: 'Apartamento moderno en Andorra la Vella',
              description: 'Hermoso apartamento completamente amueblado con vistas espectaculares a las montañas. Cuenta con 2 habitaciones, cocina equipada y balcón.',
              price: 1200,
              location: 'Andorra la Vella',
              type: 'house',
              landlord_id: landlordUser.data.id,
              images: [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
              ],
              features: {
                bedrooms: 2,
                bathrooms: 1,
                size: 75,
                furnished: true,
                petsAllowed: false
              },
              amenities: ['wifi', 'parking', 'elevator', 'heating'],
              status: 'available',
              verified: true,
              featured: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              verified_at: new Date().toISOString()
            },
            {
              title: 'Habitación en piso compartido',
              description: 'Habitación individual en piso compartido cerca del centro. Ambiente tranquilo y compañeros respetuosos. Todos los gastos incluidos.',
              price: 450,
              location: 'Escaldes-Engordany',
              type: 'room',
              landlord_id: landlordUser.data.id,
              images: [
                'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1585128792020-803d29415281?auto=format&fit=crop&w=800&q=80'
              ],
              features: {
                bedrooms: 1,
                bathrooms: 1,
                size: 15,
                furnished: true,
                petsAllowed: true
              },
              amenities: ['wifi', 'washing_machine', 'kitchen'],
              status: 'available',
              verified: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              verified_at: new Date().toISOString()
            }
          ], {
            onConflict: 'title'
          });
      }
    }

    // Create tenant user
    console.log('Creating tenant user...');
    const { data: tenantData, error: tenantError } = await supabase.auth.signUp({
      email: 'maria@example.com',
      password: 'Tenant123!',
      options: {
        data: {
          name: 'María García',
          role: 'tenant'
        }
      }
    });

    if (!tenantError || tenantError.message.includes('already registered')) {
      await supabase
        .from('users')
        .upsert([{
          id: tenantData?.user?.id,
          email: 'maria@example.com',
          name: 'María García',
          role: 'tenant',
          status: 'active',
          verified: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          verified_at: new Date().toISOString(),
          location: 'Andorra la Vella',
          bio: 'Profesional responsable buscando apartamento céntrico',
          tenant_info: {
            employmentStatus: 'employed',
            workplace: 'Banco Andorrano',
            monthlyIncome: 3500,
            residencyStatus: 'resident',
            hasPets: false,
            smoker: false,
            preferredMoveInDate: new Date().toISOString()
          }
        }], {
          onConflict: 'email'
        });
    }

    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();