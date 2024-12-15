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