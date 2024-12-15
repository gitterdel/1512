import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation(operation, name, maxRetries = MAX_RETRIES) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await operation();
      console.log(`✅ ${name} successful`);
      return result;
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1}/${maxRetries} failed for ${name}:`, error);
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
    }
  }
}

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminId = await retryOperation(async () => {
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

      const { error: profileError } = await supabase
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

      if (profileError) throw profileError;
      return adminData?.user?.id;
    }, 'Create admin user');

    // Create landlord user
    const landlordId = await retryOperation(async () => {
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

      const { error: profileError } = await supabase
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
        });

      if (profileError) throw profileError;
      return landlordData?.user?.id;
    }, 'Create landlord user');

    // Create properties
    await retryOperation(async () => {
      const { error: propertiesError } = await supabase
        .from('properties')
        .upsert([
          {
            title: 'Apartamento moderno en Andorra la Vella',
            description: 'Hermoso apartamento completamente amueblado con vistas espectaculares a las montañas. Cuenta con 2 habitaciones, cocina equipada y balcón.',
            price: 1200,
            location: 'Andorra la Vella',
            type: 'house',
            landlord_id: landlordId,
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
            landlord_id: landlordId,
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

      if (propertiesError) throw propertiesError;
    }, 'Create properties');

    // Create tenant users
    const tenants = [
      {
        email: 'maria@example.com',
        password: 'Tenant123!',
        name: 'María García',
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
      },
      {
        email: 'carlos@example.com',
        password: 'Tenant123!',
        name: 'Carlos Martínez',
        location: 'Escaldes-Engordany',
        bio: 'Ingeniero de software en búsqueda de piso',
        tenant_info: {
          employmentStatus: 'employed',
          workplace: 'Tech Solutions SA',
          monthlyIncome: 4000,
          residencyStatus: 'resident',
          hasPets: true,
          smoker: false,
          preferredMoveInDate: new Date().toISOString()
        }
      }
    ];

    for (const tenant of tenants) {
      await retryOperation(async () => {
        const { data: tenantData, error: tenantError } = await supabase.auth.signUp({
          email: tenant.email,
          password: tenant.password,
          options: {
            data: {
              name: tenant.name,
              role: 'tenant'
            }
          }
        });

        if (tenantError && !tenantError.message.includes('already registered')) {
          throw tenantError;
        }

        const { error: profileError } = await supabase
          .from('users')
          .upsert([{
            id: tenantData?.user?.id,
            email: tenant.email,
            name: tenant.name,
            role: 'tenant',
            status: 'active',
            verified: true,
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            verified_at: new Date().toISOString(),
            location: tenant.location,
            bio: tenant.bio,
            tenant_info: tenant.tenant_info
          }], {
            onConflict: 'email'
          });

        if (profileError) throw profileError;
      }, `Create tenant ${tenant.email}`);
    }

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();