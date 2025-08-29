-- Rename user_id to personnel_id to match current codebase
DO $$
BEGIN
    -- Check if user_id column exists and personnel_id doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' 
        AND column_name = 'personnel_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shops RENAME COLUMN user_id TO personnel_id;
    END IF;
    
    -- Add personnel_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' 
        AND column_name = 'personnel_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shops ADD COLUMN personnel_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
    
    -- Add team_id and status columns if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' 
        AND column_name = 'team_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE shops ADD COLUMN team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'shops' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Create enum type if it doesn't exist
        CREATE TYPE shop_status AS ENUM ('Shop m€i', 'ang V≠n H‡nh', '„ DÎng');
        ALTER TABLE shops ADD COLUMN status shop_status DEFAULT 'ang V≠n H‡nh';
    END IF;
END $$;

-- Update indexes
DROP INDEX IF EXISTS idx_shops_user_id;
CREATE INDEX IF NOT EXISTS idx_shops_personnel_id ON shops(personnel_id);