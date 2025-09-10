-- Create TikTok shops table
CREATE TABLE IF NOT EXISTS tiktok_shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nhân sự phụ trách
    status VARCHAR(50) DEFAULT 'Đang Vận Hành' CHECK (status IN ('Đang Vận Hành', 'Shop mới', 'Đã Dừng')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create TikTok comprehensive reports table
CREATE TABLE IF NOT EXISTS tiktok_comprehensive_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shop_id UUID REFERENCES tiktok_shops(id) ON DELETE CASCADE,
    report_date DATE NOT NULL,
    
    -- Revenue metrics
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(15,2) DEFAULT 0,
    
    -- Traffic metrics
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    
    -- Conversion metrics
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    click_through_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Customer metrics
    total_followers INTEGER DEFAULT 0,
    new_followers INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    new_customers INTEGER DEFAULT 0,
    returning_customers INTEGER DEFAULT 0,
    
    -- Return/Cancel metrics
    cancelled_orders INTEGER DEFAULT 0,
    cancelled_revenue DECIMAL(15,2) DEFAULT 0,
    returned_orders INTEGER DEFAULT 0,
    returned_revenue DECIMAL(15,2) DEFAULT 0,
    
    -- Goals
    feasible_goal DECIMAL(15,2),
    breakthrough_goal DECIMAL(15,2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_tiktok_report_date_shop UNIQUE (report_date, shop_id)
);

-- Enable RLS for both tables
ALTER TABLE tiktok_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiktok_comprehensive_reports ENABLE ROW LEVEL SECURITY;

-- Policies for tiktok_shops
CREATE POLICY "Users can view tiktok shops" ON tiktok_shops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage tiktok shops" ON tiktok_shops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policies for tiktok_comprehensive_reports
CREATE POLICY "Users can view tiktok reports" ON tiktok_comprehensive_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
        )
    );

CREATE POLICY "Admin can manage tiktok reports" ON tiktok_comprehensive_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tiktok_comprehensive_reports_date ON tiktok_comprehensive_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_comprehensive_reports_shop_id ON tiktok_comprehensive_reports(shop_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_comprehensive_reports_created_at ON tiktok_comprehensive_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tiktok_shops_profile_id ON tiktok_shops(profile_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_tiktok_shops_updated_at BEFORE UPDATE ON tiktok_shops
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tiktok_comprehensive_reports_updated_at BEFORE UPDATE ON tiktok_comprehensive_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();