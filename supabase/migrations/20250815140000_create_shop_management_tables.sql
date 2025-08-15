-- Create shops table for comprehensive reports (separate from existing shop system)
CREATE TABLE IF NOT EXISTS shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nhân sự phụ trách
    leader_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Leader phụ trách
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add shop_id to comprehensive_reports table
ALTER TABLE comprehensive_reports 
ADD COLUMN IF NOT EXISTS shop_id UUID REFERENCES shops(id) ON DELETE SET NULL;

-- Update the unique constraint to include shop_id
ALTER TABLE comprehensive_reports 
DROP CONSTRAINT IF EXISTS unique_report_date;

ALTER TABLE comprehensive_reports 
ADD CONSTRAINT unique_report_date_shop UNIQUE (report_date, shop_id);

-- Enable RLS for shops table
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;

-- Policy for admin and leader to view shops
CREATE POLICY "Admin and leaders can view shops" ON shops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader')
        )
    );

-- Policy for admin to manage shops
CREATE POLICY "Admin can manage shops" ON shops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy for leaders to manage their assigned shops
CREATE POLICY "Leaders can manage assigned shops" ON shops
    FOR ALL USING (
        auth.uid() = leader_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shops_name ON shops(name);
CREATE INDEX IF NOT EXISTS idx_shops_user_id ON shops(user_id);
CREATE INDEX IF NOT EXISTS idx_shops_leader_id ON shops(leader_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_shop_id ON comprehensive_reports(shop_id);

-- Insert sample data
INSERT INTO shops (name, description) VALUES 
('Shop Demo 1', 'Shop mẫu cho testing'),
('Shop Demo 2', 'Shop mẫu thứ hai')
ON CONFLICT (name) DO NOTHING;