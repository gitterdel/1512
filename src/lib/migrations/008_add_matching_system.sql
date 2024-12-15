-- Add matching system related columns
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS matching_preferences JSONB DEFAULT '{
  "priceRange": [0, 5000],
  "preferredLocations": [],
  "propertyType": "any",
  "minStayDuration": 6,
  "moveInDate": null,
  "requirements": {
    "petsAllowed": false,
    "smokingAllowed": false,
    "studentAllowed": true,
    "minimumIncome": 0
  }
}'::jsonb;

-- Add matches table for tracking tenant-landlord matches
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES public.users(id),
    landlord_id UUID REFERENCES public.users(id),
    property_id UUID REFERENCES public.properties(id),
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    compatibility_score INTEGER NOT NULL CHECK (compatibility_score BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(tenant_id, property_id)
);

-- Add trigger for updating matches.updated_at
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_matches_updated_at
    BEFORE UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION update_matches_updated_at();

-- Enable RLS for matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create policies for matches table
CREATE POLICY "Enable read access for involved users"
    ON public.matches FOR SELECT
    USING (
        auth.uid() = tenant_id OR 
        auth.uid() = landlord_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Enable insert for tenants"
    ON public.matches FOR INSERT
    WITH CHECK (
        auth.uid() = tenant_id AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'tenant'
        )
    );

CREATE POLICY "Enable update for landlords and admins"
    ON public.matches FOR UPDATE
    USING (
        auth.uid() = landlord_id OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );