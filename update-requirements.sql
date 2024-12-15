-- SQL para que el administrador actualice la base de datos
-- Este archivo debe ser ejecutado por el administrador de la base de datos

-- Añadir la columna requirements si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'requirements'
    ) THEN
        ALTER TABLE public.properties 
        ADD COLUMN requirements JSONB DEFAULT '{
            "deposit": 2,
            "minStay": 6,
            "documents": {
                "payslips": true,
                "bankGuarantee": false,
                "idCard": true,
                "employmentContract": true,
                "taxReturns": false
            },
            "otherRequirements": []
        }'::jsonb;

        -- Actualizar las propiedades existentes con valores por defecto
        UPDATE public.properties
        SET requirements = '{
            "deposit": 2,
            "minStay": 6,
            "documents": {
                "payslips": true,
                "bankGuarantee": false,
                "idCard": true,
                "employmentContract": true,
                "taxReturns": false
            },
            "otherRequirements": []
        }'::jsonb
        WHERE requirements IS NULL;
    END IF;
END $$;