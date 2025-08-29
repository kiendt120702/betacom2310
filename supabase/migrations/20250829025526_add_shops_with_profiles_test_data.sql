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
        INSERT INTO shops (name, status, profile_id, team_id) VALUES
            ('Shop c蓷 Admin', 'ang V要 H跣h', admin_profile_id, NULL)
        ON CONFLICT (name) DO UPDATE SET 
            profile_id = admin_profile_id,
            status = 'ang V要 H跣h';
    END IF;
    
    IF leader_profile_id IS NOT NULL THEN
        INSERT INTO shops (name, status, profile_id, team_id) VALUES
            ('Shop c蓷 Leader', 'ang V要 H跣h', leader_profile_id, NULL)
        ON CONFLICT (name) DO UPDATE SET 
            profile_id = leader_profile_id,
            status = 'ang V要 H跣h';
    END IF;
END $$;