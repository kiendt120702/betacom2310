-- Add shops with actual profile assignments for testing
DO $$
DECLARE
    admin_profile_id UUID;
    leader_profile_id UUID;
BEGIN
    -- Get first admin profile
    SELECT id INTO admin_profile_id 
    FROM profiles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- Get first leader profile
    SELECT id INTO leader_profile_id 
    FROM profiles 
    WHERE role = 'leader' 
    LIMIT 1;
    
    -- Insert shops with profile assignments if profiles exist
    IF admin_profile_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM shopee_shops WHERE name = 'Shop của Admin') THEN
            INSERT INTO shopee_shops (name, status, profile_id, team_id) VALUES
                ('Shop của Admin', 'Đang Vận Hành', admin_profile_id, NULL);
        END IF;
    END IF;
    
    IF leader_profile_id IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM shopee_shops WHERE name = 'Shop của Leader') THEN
            INSERT INTO shopee_shops (name, status, profile_id, team_id) VALUES
                ('Shop của Leader', 'Đang Vận Hành', leader_profile_id, NULL);
        END IF;
    END IF;
END $$;