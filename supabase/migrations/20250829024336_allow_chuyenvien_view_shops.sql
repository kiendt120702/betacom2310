-- Update the existing policy to also allow chuyenvien role to view shops
DROP POLICY IF EXISTS "Admin and leaders can view shops" ON shops;

CREATE POLICY "Admin, leaders, and chuyenvien can view shops" ON shops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader', 'chuyenvien')
        )
    );

-- Also update the manage policy to include chuyenvien for editing
CREATE POLICY "Admin and chuyenvien can manage shops" ON shops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'chuyenvien')
        )
    );