-- Add test data with manager relationships for testing Leader display
DO $$
DECLARE
    admin_profile_id UUID;
    leader_profile_id UUID;
    chuyenvien_profile_id UUID;
BEGIN
    -- Get profiles for testing
    SELECT id INTO admin_profile_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    SELECT id INTO leader_profile_id 
    FROM profiles 
    WHERE role = 'leader' 
    LIMIT 1;
    
    SELECT id INTO chuyenvien_profile_id 
    FROM profiles 
    WHERE role = 'chuyenvien' 
    LIMIT 1;
    
    -- Create or update profiles with manager relationships if they exist
    IF admin_profile_id IS NOT NULL AND leader_profile_id IS NOT NULL THEN
        -- Set admin as manager for some test profiles
        UPDATE profiles 
        SET manager_id = admin_profile_id,
            full_name = COALESCE(full_name, 'Test Staff 1')
        WHERE role = 'chuyenvien' 
        AND manager_id IS NULL 
        LIMIT 2;
        
        -- Set leader as manager for some other profiles  
        UPDATE profiles 
        SET manager_id = leader_profile_id,
            full_name = COALESCE(full_name, 'Test Staff 2')
        WHERE role = 'chuyenvien' 
        AND manager_id IS NULL 
        LIMIT 1;
    END IF;
    
    -- Update existing shops to assign profiles with managers
    IF EXISTS (SELECT 1 FROM profiles WHERE manager_id IS NOT NULL LIMIT 1) THEN
        -- Get first profile with a manager
        SELECT id INTO chuyenvien_profile_id 
        FROM profiles 
        WHERE manager_id IS NOT NULL 
        LIMIT 1;
        
        -- Assign this profile to a test shop
        IF chuyenvien_profile_id IS NOT NULL THEN
            INSERT INTO shops (name, status, profile_id, team_id) VALUES
                ('Shop có Leader', 'ang V­n Hành', chuyenvien_profile_id, NULL)
            ON CONFLICT (name) DO UPDATE SET 
                profile_id = chuyenvien_profile_id,
                status = 'ang V­n Hành';
        END IF;
    END IF;
END $$;