-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create storage extension if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'storage'
  ) THEN
    CREATE EXTENSION "storage" SCHEMA storage;
  END IF;
END $$;

-- Ensure storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Recreate storage functions if needed
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
BEGIN
  RETURN string_to_array(name, '/');
END;
$$ LANGUAGE plpgsql IMMUTABLE;