-- Drop existing RLS policies for properties
DROP POLICY IF EXISTS "Enable read access for all properties" ON public.properties;
DROP POLICY IF EXISTS "Enable insert for landlords" ON public.properties;
DROP POLICY IF EXISTS "Enable update for property owners" ON public.properties;

-- Create new RLS policies for properties
CREATE POLICY "Enable read access for all properties"
    ON public.properties FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for landlords and admins"
    ON public.properties FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role IN ('landlord', 'admin')
            AND status = 'active'
        )
    );

CREATE POLICY "Enable update for property owners and admins"
    ON public.properties FOR UPDATE
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND status = 'active'
        )
    );

CREATE POLICY "Enable delete for property owners and admins"
    ON public.properties FOR DELETE
    USING (
        landlord_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() 
            AND role = 'admin'
            AND status = 'active'
        )
    );

-- Ensure RLS is enabled
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;