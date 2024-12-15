-- Create trigger to handle tenant_info updates
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