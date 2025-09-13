-- Rename personnel_id to profile_id to match expected naming convention
DO $$
BEGIN
    -- Check if personnel_id exists and profile_id doesn't exist
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'personnel_id'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'profile_id'
        AND table_schema = 'public'
    ) THEN
        -- Rename personnel_id to profile_id
        ALTER TABLE shopee_shops RENAME COLUMN personnel_id TO profile_id;
        
        -- Update index
        DROP INDEX IF EXISTS idx_shops_personnel_id;
        CREATE INDEX IF NOT EXISTS idx_shopee_shops_profile_id ON shopee_shops(profile_id);
    END IF;
END $$;