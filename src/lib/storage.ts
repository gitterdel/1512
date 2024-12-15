import { StorageError } from '@supabase/storage-js';
import { supabase } from './supabase';
import { toast } from 'react-hot-toast';

class StorageService {
  private static instance: StorageService;
  private initialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  private constructor() {}

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private async createStorageSchema(): Promise<void> {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE SCHEMA IF NOT EXISTS storage;

          CREATE TABLE IF NOT EXISTS storage.buckets (
            id text PRIMARY KEY,
            name text NOT NULL,
            owner uuid REFERENCES auth.users,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            public boolean DEFAULT false,
            avif_autodetection boolean DEFAULT false,
            file_size_limit bigint,
            allowed_mime_types text[]
          );

          CREATE TABLE IF NOT EXISTS storage.objects (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            bucket_id text REFERENCES storage.buckets(id),
            name text NOT NULL,
            owner uuid REFERENCES auth.users,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now(),
            last_accessed_at timestamptz DEFAULT now(),
            metadata jsonb DEFAULT '{}'::jsonb,
            path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/')) STORED
          );

          ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
          ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;
        `
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating storage schema:', error);
      throw error;
    }
  }

  private async createStoragePolicies(): Promise<void> {
    try {
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE POLICY "Public buckets are viewable by everyone"
            ON storage.buckets FOR SELECT
            USING (public = true);

          CREATE POLICY "Users can create buckets"
            ON storage.buckets FOR INSERT
            WITH CHECK (auth.role() = 'authenticated');

          CREATE POLICY "Public objects are viewable by everyone"
            ON storage.objects FOR SELECT
            USING (bucket_id IN (
              SELECT id FROM storage.buckets WHERE public = true
            ));

          CREATE POLICY "Users can upload objects to public buckets"
            ON storage.objects FOR INSERT
            WITH CHECK (
              bucket_id IN (SELECT id FROM storage.buckets WHERE public = true)
              AND auth.role() = 'authenticated'
            );

          CREATE POLICY "Users can update their own objects"
            ON storage.objects FOR UPDATE
            USING (auth.uid() = owner);

          CREATE POLICY "Users can delete their own objects"
            ON storage.objects FOR DELETE
            USING (auth.uid() = owner);
        `
      });

      if (error && !error.message.includes('already exists')) {
        throw error;
      }
    } catch (error) {
      console.error('Error creating storage policies:', error);
      throw error;
    }
  }

  private async createAvatarsBucket(): Promise<void> {
    try {
      const { error: bucketError } = await supabase.rpc('exec_sql', {
        sql_query: `
          INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
          VALUES (
            'avatars',
            'avatars',
            true,
            2097152,
            ARRAY['image/jpeg', 'image/png', 'image/gif']
          )
          ON CONFLICT (id) DO UPDATE SET
            public = true,
            file_size_limit = 2097152,
            allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];
        `
      });

      if (bucketError && !bucketError.message.includes('already exists')) {
        throw bucketError;
      }

      const { error: policiesError } = await supabase.rpc('exec_sql', {
        sql_query: `
          CREATE POLICY "Avatar files are publicly accessible"
            ON storage.objects FOR SELECT
            USING (bucket_id = 'avatars');

          CREATE POLICY "Users can upload their own avatars"
            ON storage.objects FOR INSERT
            WITH CHECK (
              bucket_id = 'avatars'
              AND auth.uid() = owner
              AND (storage.foldername(name))[1] = auth.uid()::text
            );

          CREATE POLICY "Users can update their own avatars"
            ON storage.objects FOR UPDATE
            USING (
              bucket_id = 'avatars'
              AND auth.uid() = owner
              AND (storage.foldername(name))[1] = auth.uid()::text
            );

          CREATE POLICY "Users can delete their own avatars"
            ON storage.objects FOR DELETE
            USING (
              bucket_id = 'avatars'
              AND auth.uid() = owner
              AND (storage.foldername(name))[1] = auth.uid()::text
            );
        `
      });

      if (policiesError && !policiesError.message.includes('already exists')) {
        throw policiesError;
      }
    } catch (error) {
      console.error('Error creating avatars bucket:', error);
      throw error;
    }
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) return;

        // Create storage infrastructure
        await this.createStorageSchema();
        await this.createStoragePolicies();
        await this.createAvatarsBucket();
        
        this.initialized = true;
      } catch (error) {
        console.error('Storage initialization error:', error);
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * this.retryCount));
          return this.initialize();
        }

        if (error instanceof StorageError) {
          switch (error.statusCode) {
            case 400:
              toast.error('Error al inicializar el almacenamiento');
              break;
            case 401:
              toast.error('Sesión expirada, por favor inicia sesión de nuevo');
              break;
            case 403:
              console.warn('Storage permissions limited');
              this.initialized = true;
              return;
            default:
              toast.error('Error al inicializar el almacenamiento');
          }
        }
        
        throw error;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  public async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      await this.initialize();

      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const filePath = `${userId}/${timestamp}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (urlError) throw urlError;

      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      if (error instanceof StorageError) {
        switch (error.statusCode) {
          case 400:
            toast.error('Formato de archivo no válido');
            break;
          case 413:
            toast.error('El archivo es demasiado grande');
            break;
          case 401:
            toast.error('Sesión expirada, por favor inicia sesión de nuevo');
            break;
          default:
            toast.error('Error al subir el avatar');
        }
      }
      throw error;
    }
  }

  public async deleteAvatar(filePath: string): Promise<void> {
    try {
      await this.initialize();

      const { error } = await supabase.storage
        .from('avatars')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Error al eliminar el avatar');
      throw error;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();