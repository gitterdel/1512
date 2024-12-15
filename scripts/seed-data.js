import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rxvcwxteuwjtvgweslhh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dmN3eHRldXdqdHZnd2VzbGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4NDcwNDMsImV4cCI6MjA0NzQyMzA0M30.x1sfV1hJQCyNfpuU4QmJS7zWxio1sFGreiq7yFdkZZA';

const supabase = createClient(supabaseUrl, supabaseKey);

const sampleTenants = [
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
      preferredMoveInDate: new Date().toISOString(),
      references: {
        employer: true,
        previousLandlord: true
      },
      documents: {
        residencyPermit: true,
        employmentContract: true,
        bankStatements: true
      }
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
      preferredMoveInDate: new Date().toISOString(),
      references: {
        employer: true,
        previousLandlord: true
      },
      documents: {
        residencyPermit: true,
        employmentContract: true,
        bankStatements: true
      }
    }
  },
  {
    email: 'ana@example.com',
    password: 'Tenant123!',
    name: 'Ana Sánchez',
    location: 'La Massana',
    bio: 'Médico residente buscando alojamiento tranquilo',
    tenant_info: {
      employmentStatus: 'employed',
      workplace: 'Hospital Nostra Senyora de Meritxell',
      monthlyIncome: 4500,
      residencyStatus: 'resident',
      hasPets: false,
      smoker: false,
      preferredMoveInDate: new Date().toISOString(),
      references: {
        employer: true,
        previousLandlord: true
      },
      documents: {
        residencyPermit: true,
        employmentContract: true,
        bankStatements: true
      }
    }
  }
];

const sampleProperties = [
  {
    title: 'Apartamento moderno en Andorra la Vella',
    description: 'Hermoso apartamento completamente amueblado con vistas espectaculares a las montañas. Cuenta con 2 habitaciones, cocina equipada y balcón.',
    price: 1200,
    location: 'Andorra la Vella',
    type: 'house',
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
    status: 'available',
    verified: true
  },
  {
    title: 'Habitación en piso compartido',
    description: 'Habitación individual en piso compartido cerca del centro. Ambiente tranquilo y compañeros respetuosos. Todos los gastos incluidos.',
    price: 450,
    location: 'Escaldes-Engordany',
    type: 'room',
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
    status: 'available',
    verified: true
  }
];

async function seedDatabase() {
  try {
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

    if (adminError && !adminError.message.includes('User already registered')) {
      throw adminError;
    }

    // Create admin profile
    const { error: adminProfileError } = await supabase
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
      }]);

    if (adminProfileError) {
      console.error('Error creating admin profile:', adminProfileError);
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

    if (landlordError && !landlordError.message.includes('User already registered')) {
      throw landlordError;
    }

    // Create landlord profile
    const { error: landlordProfileError } = await supabase
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
      }]);

    if (landlordProfileError) {
      console.error('Error creating landlord profile:', landlordProfileError);
    }

    console.log('Creating featured tenants...');

    // Create featured tenants
    for (const tenant of sampleTenants) {
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

      if (tenantError && !tenantError.message.includes('User already registered')) {
        console.error(`Error creating tenant ${tenant.email}:`, tenantError);
        continue;
      }

      if (tenantData?.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert([{
            id: tenantData.user.id,
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
          }]);

        if (profileError) {
          console.error(`Error creating tenant profile ${tenant.email}:`, profileError);
        }
      }
    }

    console.log('Creating sample properties...');

    // Create properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .upsert(
        sampleProperties.map(property => ({
          ...property,
          landlord_id: landlordData?.user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          verified_at: new Date().toISOString()
        }))
      );

    if (propertiesError) {
      console.error('Error creating properties:', propertiesError);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();