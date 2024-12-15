-- Function to calculate compatibility score
CREATE OR REPLACE FUNCTION calculate_compatibility_score(
    tenant_id UUID,
    property_id UUID
) RETURNS INTEGER AS $$
DECLARE
    tenant_info JSONB;
    property_info RECORD;
    score INTEGER := 0;
BEGIN
    -- Get tenant info
    SELECT tenant_info INTO tenant_info
    FROM public.users
    WHERE id = tenant_id;

    -- Get property info
    SELECT * INTO property_info
    FROM public.properties
    WHERE id = property_id;

    -- Base score calculations
    -- Income check (30 points)
    IF (tenant_info->>'monthlyIncome')::numeric >= property_info.price * 3 THEN
        score := score + 30;
    ELSIF (tenant_info->>'monthlyIncome')::numeric >= property_info.price * 2.5 THEN
        score := score + 20;
    END IF;

    -- Verification status (20 points)
    IF EXISTS (
        SELECT 1 FROM public.users
        WHERE id = tenant_id AND verified = true
    ) THEN
        score := score + 20;
    END IF;

    -- References (20 points)
    IF tenant_info->'references' IS NOT NULL AND tenant_info->'references' != 'null' THEN
        score := score + 20;
    END IF;

    -- Employment status (15 points)
    IF tenant_info->>'employmentStatus' IN ('employed', 'self_employed') THEN
        score := score + 15;
    END IF;

    -- Documents (15 points)
    IF (tenant_info->'documents'->>'employmentContract')::boolean = true THEN
        score := score + 8;
    END IF;
    IF (tenant_info->'documents'->>'bankStatements')::boolean = true THEN
        score := score + 7;
    END IF;

    RETURN score;
END;
$$ LANGUAGE plpgsql;