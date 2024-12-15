-- Fix reports table structure
ALTER TABLE public.reports 
DROP COLUMN IF EXISTS type CASCADE;

ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('property', 'message', 'user')),
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id),
ADD COLUMN IF NOT EXISTS message_id UUID;

-- Update existing reports to use property_id
UPDATE public.reports 
SET property_id = target_id 
WHERE type = 'property';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_property_id ON public.reports(property_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);