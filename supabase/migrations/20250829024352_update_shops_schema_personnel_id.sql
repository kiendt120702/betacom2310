-- Update shopee_shops schema to match current codebase
DO $$
BEGIN
    -- Check if user_id column exists and profile_id doesn't in shopee_shops
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'profile_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shopee_shops RENAME COLUMN user_id TO profile_id;
    END IF;
    
    -- Add profile_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'profile_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shopee_shops ADD COLUMN profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Add team_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'team_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shopee_shops ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    END IF;
    
    -- Create enum type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shopee_shop_status') THEN
        CREATE TYPE shopee_shop_status AS ENUM ('Shop mới', 'Đang Vận Hành', 'Đã Dừng');
    END IF;
    
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shopee_shops' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shopee_shops ADD COLUMN status shopee_shop_status DEFAULT 'Đang Vận Hành';
    END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_shops_user_id;
CREATE INDEX IF NOT EXISTS idx_shopee_shops_profile_id ON shopee_shops(profile_id);