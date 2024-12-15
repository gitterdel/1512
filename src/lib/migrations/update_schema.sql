-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for own profile" ON public.users;

-- Add tenant_info column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tenant_info JSONB DEFAULT '{
  "employmentStatus": "employed",
  "workplace": null,
  "monthlyIncome": null,
  "residencyStatus": "resident",
  "hasPets": false,
  "smoker": false,
  "preferredMoveInDate": null,
  "references": null,
  "documents": {
    "residencyPermit": false,
    "employmentContract": false,
    "bankStatements": false
  }
}'::jsonb;

-- Recreate policies
CREATE POLICY "Enable read access for all users"
    ON public.users FOR SELECT
    USING (true);

CREATE POLICY "Enable insert for authenticated users"
    ON public.users FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Create trigger for tenant_info updates
CREATE OR REPLACE FUNCTION handle_tenant_info_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'tenant' AND NEW.tenant_info IS NULL THEN
    NEW.tenant_info = '{
      "employmentStatus": "employed",
      "workplace": null,
      "monthlyIncome": null,
      "residencyStatus": "resident",
      "hasPets": false,
      "smoker": false,
      "preferredMoveInDate": null,
      "references": null,
      "documents": {
        "residencyPermit": false,
        "employmentContract": false,
        "bankStatements": false
      }
    }'::jsonb;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_tenant_info ON public.users;
CREATE TRIGGER set_tenant_info
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_tenant_info_update();