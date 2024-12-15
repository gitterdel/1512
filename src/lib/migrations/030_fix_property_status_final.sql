-- Drop existing status constraint
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

-- Add new status constraint with all valid states
ALTER TABLE public.properties
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('available', 'reserved', 'rented', 'pending', 'verified', 'hidden'));

-- Update any invalid status values
UPDATE public.properties 
SET status = 'available' 
WHERE status NOT IN ('available', 'reserved', 'rented', 'pending', 'verified', 'hidden');