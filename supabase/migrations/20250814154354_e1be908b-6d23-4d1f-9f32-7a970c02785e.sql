
-- Create comprehensive reports table
CREATE TABLE IF NOT EXISTS public.comprehensive_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_date DATE NOT NULL,
    total_revenue DECIMAL(15,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    average_order_value DECIMAL(15,2) DEFAULT 0,
    product_clicks INTEGER DEFAULT 0,
    total_visits INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    cancelled_orders INTEGER DEFAULT 0,
    cancelled_revenue DECIMAL(15,2) DEFAULT 0,
    returned_orders INTEGER DEFAULT 0,
    returned_revenue DECIMAL(15,2) DEFAULT 0,
    total_buyers INTEGER DEFAULT 0,
    new_buyers INTEGER DEFAULT 0,
    existing_buyers INTEGER DEFAULT 0,
    potential_buyers INTEGER DEFAULT 0,
    buyer_return_rate DECIMAL(5,4) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Add unique constraint on date
    CONSTRAINT unique_report_date UNIQUE (report_date)
);

-- Enable RLS
ALTER TABLE comprehensive_reports ENABLE ROW LEVEL SECURITY;

-- Policy for admin and leader to read reports
-- Drop existing policy first to avoid conflicts
DROP POLICY IF EXISTS "Admin and leaders can view reports" ON comprehensive_reports;
CREATE POLICY "Admin and leaders can view reports" ON comprehensive_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader')
        )
    );

-- Policy for admin to insert/update/delete reports
-- Drop existing policy first to avoid conflicts
DROP POLICY IF EXISTS "Admin can manage reports" ON comprehensive_reports;
CREATE POLICY "Admin can manage reports" ON comprehensive_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_date ON comprehensive_reports(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_created_at ON comprehensive_reports(created_at DESC);

-- Insert sample data for testing
INSERT INTO comprehensive_reports (
    report_date,
    total_revenue,
    total_orders,
    average_order_value,
    product_clicks,
    total_visits,
    conversion_rate,
    cancelled_orders,
    cancelled_revenue,
    returned_orders,
    returned_revenue,
    total_buyers,
    new_buyers,
    existing_buyers,
    potential_buyers,
    buyer_return_rate
) VALUES (
    CURRENT_DATE - INTERVAL '1 day',
    1500000.00,
    150,
    10000.00,
    750,
    1500,
    0.1000,
    8,
    80000.00,
    5,
    50000.00,
    142,
    30,
    112,
    300,
    0.7887
) ON CONFLICT (report_date) DO NOTHING;
