-- Update the existing policy to also allow chuyên viên role to view shops (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shopee_shops') THEN
        DROP POLICY IF EXISTS "Admin and leaders can view shops" ON shopee_shops;

        CREATE POLICY "Admin, leaders, and chuyên viên can view shops" ON shopee_shops
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'leader', 'chuyên viên')
                )
            );

        -- Also update the manage policy to include chuyên viên for editing
        CREATE POLICY "Admin and chuyên viên can manage shops" ON shopee_shops
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN ('admin', 'chuyên viên')
                )
            );
    END IF;
END $$;