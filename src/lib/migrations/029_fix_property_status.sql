-- Update property status constraint
ALTER TABLE public.properties 
DROP CONSTRAINT IF EXISTS properties_status_check;

ALTER TABLE public.properties
ADD CONSTRAINT properties_status_check 
CHECK (status IN ('available', 'reserved', 'rented', 'pending', 'verified'));