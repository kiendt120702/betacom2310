-- Allow HR Specialists (Chuyên Viên Phòng Nhân Sự) to view all Shopee Comprehensive Reports
-- This migration updates RLS policies for comprehensive reports access

-- First, handle the comprehensive_reports table (base table)
DROP POLICY IF EXISTS "Admin and leaders can view reports" ON comprehensive_reports;

CREATE POLICY "Admin, leaders, and HR specialists can view reports" ON comprehensive_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader', 'chuyên viên')
        )
    );

-- Handle shopee_comprehensive_reports table if it exists separately
-- This section will handle both potential table structures
DO $$
BEGIN
    -- Check if shopee_comprehensive_reports table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shopee_comprehensive_reports'
    ) THEN
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Admin and leaders can view shopee reports" ON shopee_comprehensive_reports;
        DROP POLICY IF EXISTS "Admin, leaders, and HR specialists can view shopee reports" ON shopee_comprehensive_reports;
        
        -- Create new policy allowing HR specialists to view all data
        EXECUTE 'CREATE POLICY "Admin, leaders, and HR specialists can view shopee reports" ON shopee_comprehensive_reports
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN (''admin'', ''leader'', ''chuyên viên'')
                )
            )';
        
        -- Also update management policy if needed
        DROP POLICY IF EXISTS "Admin can manage shopee reports" ON shopee_comprehensive_reports;
        
        EXECUTE 'CREATE POLICY "Admin and HR specialists can manage shopee reports" ON shopee_comprehensive_reports
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN (''admin'', ''chuyên viên'')
                )
            )';
    ELSE
        -- If shopee_comprehensive_reports doesn't exist, create it as a view or ensure comprehensive_reports covers Shopee data
        RAISE NOTICE 'shopee_comprehensive_reports table not found - comprehensive_reports table policy updated instead';
    END IF;
END $$;

-- Update shopee_shops table policies to ensure HR specialists can view shop data
DROP POLICY IF EXISTS "Admin, leaders, and chuyenvien can view shops" ON shopee_shops;

-- Create comprehensive policy for shopee_shops
CREATE POLICY "Admin, leaders, and HR specialists can view shopee shops" ON shopee_shops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader', 'chuyên viên')
        )
    );

-- Ensure shops table (if different from shopee_shops) also allows HR specialist access
-- This covers the case where there are multiple shop-related tables
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'shops'
    ) THEN
        -- Update shops table policy
        DROP POLICY IF EXISTS "Admin, leaders, and chuyenvien can view shops" ON shops;
        DROP POLICY IF EXISTS "Admin, leaders, and HR specialists can view shops" ON shops;
        
        EXECUTE 'CREATE POLICY "Admin, leaders, and HR specialists can view shops" ON shops
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE profiles.id = auth.uid() 
                    AND profiles.role IN (''admin'', ''leader'', ''chuyên viên'')
                )
            )';
    END IF;
END $$;

-- Add comment explaining the change
COMMENT ON POLICY "Admin, leaders, and HR specialists can view reports" ON comprehensive_reports IS 
'Updated to allow HR specialists (chuyên viên) to view all comprehensive report data for administrative and personnel management purposes';