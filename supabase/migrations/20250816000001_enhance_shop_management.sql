-- Add company_id and team_id to shops table for better organization
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;

-- Add goals to comprehensive_reports for tracking performance
ALTER TABLE comprehensive_reports 
ADD COLUMN IF NOT EXISTS feasible_goal DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS breakthrough_goal DECIMAL(15,2) DEFAULT 0;

-- Create companies table for better organization
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add company_id to shops table
ALTER TABLE shops 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Enable RLS for companies table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy for admin and leader to view companies
CREATE POLICY "Admin and leaders can view companies" ON companies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'leader')
        )
    );

-- Policy for admin to manage companies
CREATE POLICY "Admin can manage companies" ON companies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shops_team_id ON shops(team_id);
CREATE INDEX IF NOT EXISTS idx_shops_company_id ON shops(company_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_reports_goals ON comprehensive_reports(feasible_goal, breakthrough_goal);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);

-- Insert sample companies
INSERT INTO companies (name, description) VALUES 
('Công ty A', 'Công ty mẫu A'),
('Công ty B', 'Công ty mẫu B')
ON CONFLICT (name) DO NOTHING;

-- Update sample shops with team and company assignments (optional)
-- You can manually assign these later through the admin interface