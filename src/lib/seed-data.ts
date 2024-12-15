import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // First check if we already have data
    const { data: existingData, error: checkError } = await supabase
      .from('users')
      .select('count');

    if (!checkError && existingData && existingData.length > 0) {
      console.log('Database already has data, skipping seed');
      return true;
    }

    // Disable RLS temporarily
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
      `
    });

    console.log('Creating admin user...');

    // Create admin user
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

    if (adminError && !adminError.message.includes('already registered')) {
      throw adminError;
    }

    // Create admin profile
    const { error: adminProfileError } = await supabase
      .from('users')
      .insert({
        id: adminData?.user?.id,
        email: 'admin@renthub.com',
        name: 'Administrador',
        role: 'admin',
        status: 'active',
        verified: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        verified_at: new Date().toISOString()
      });

    if (adminProfileError) {
      throw adminProfileError;
    }

    console.log('Creating landlord user...');

    // Create landlord user
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

    if (landlordError && !landlordError.message.includes('already registered')) {
      throw landlordError;
    }

    // Create landlord profile
    const { error: landlordProfileError } = await supabase
      .from('users')
      .insert({
        id: landlordData?.user?.id,
        email: 'landlord@example.com',
        name: 'Juan Propietario',
        role: 'landlord',
        status: 'active',
        verified: true,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
        verified_at: new Date().toISOString(),
        location: 'Andorra la Vella',
        bio: 'Propietario con experiencia en el sector inmobiliario'
      });

    if (landlordProfileError) {
      throw landlordProfileError;
    }

    console.log('Creating sample properties...');

    // Create sample properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .insert([
        {
          title: 'Ático de lujo con vistas panorámicas',
          description: 'Espectacular ático con vistas panorámicas a las montañas. Acabados de alta calidad, terraza privada de 50m², y todas las comodidades modernas.',
          price: 2500,
          location: 'Andorra la Vella',
          type: 'house',
          landlord_id: landlordData?.user?.id,
          images: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
          ],
          features: {
            bedrooms: 3,
            bathrooms: 2,
            size: 150,
            furnished: true,
            petsAllowed: false
          },
          amenities: ['parking', 'elevator', 'heating', 'ac', 'storage'],
          status: 'available',
          verified: true,
          featured: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verified_at: new Date().toISOString()
        },
        {
          title: 'Apartamento moderno en el centro',
          description: 'Moderno apartamento totalmente reformado en el corazón de la ciudad. Cocina equipada, suelos de parquet y abundante luz natural.',
          price: 1800,
          location: 'Escaldes-Engordany',
          type: 'house',
          landlord_id: landlordData?.user?.id,
          images: [
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80'
          ],
          features: {
            bedrooms: 2,
            bathrooms: 1,
            size: 85,
            furnished: true,
            petsAllowed: true
          },
          amenities: ['wifi', 'elevator', 'heating'],
          status: 'available',
          verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verified_at: new Date().toISOString()
        }
      ]);

    if (propertiesError) {
      throw propertiesError;
    }

    console.log('Creating tenant user...');

    // Create tenant user
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

    if (tenantError && !tenantError.message.includes('already registered')) {
      throw tenantError;
    }

    // Create tenant profile
    const { error: tenantProfileError } = await supabase
      .from('users')
      .insert({
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
      });

    if (tenantProfileError) {
      throw tenantProfileError;
    }

    // Re-enable RLS
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
      `
    });

    console.log('Database seeding completed successfully');
    toast.success('Datos de ejemplo creados correctamente');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    toast.error('Error al crear datos de ejemplo');

    // Re-enable RLS in case of error
    await supabase.rpc('exec_sql', {
      sql_query: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
      `
    }).catch(console.error);

    return false;
  }
};