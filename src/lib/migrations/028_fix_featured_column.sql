-- Add featured column to properties if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'properties' 
    AND column_name = 'featured'
  ) THEN
    ALTER TABLE public.properties
    ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;
END $$;