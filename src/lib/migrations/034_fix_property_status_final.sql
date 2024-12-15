-- Fix property status with proper syntax
DO $$ 
BEGIN
  -- Drop existing constraint if it exists
  ALTER TABLE public.properties 
  DROP CONSTRAINT IF EXISTS properties_status_check;

  -- Add new constraint
  ALTER TABLE public.properties
  ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('available', 'reserved', 'rented', 'pending', 'verified', 'hidden'));

  -- Update any invalid status values
  UPDATE public.properties 
  SET status = 'available' 
  WHERE status IS NULL OR status NOT IN ('available', 'reserved', 'rented', 'pending', 'verified', 'hidden');

  -- Set default value
  ALTER TABLE public.properties
  ALTER COLUMN status SET DEFAULT 'available';
END $$;