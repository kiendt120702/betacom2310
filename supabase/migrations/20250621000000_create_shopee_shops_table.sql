-- Create enum type for shopee shop status first
DO $$ BEGIN
    CREATE TYPE shopee_shop_status AS ENUM ('Shop mới', 'Đang Vận Hành', 'Đã Dừng');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create shopee_shops table (missing dependency for other migrations)
CREATE TABLE IF NOT EXISTS shopee_shops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status shopee_shop_status DEFAULT 'Đang Vận Hành'::shopee_shop_status,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_shopee_shops_profile_id ON shopee_shops(profile_id);
CREATE INDEX IF NOT EXISTS idx_shopee_shops_team_id ON shopee_shops(team_id);
CREATE INDEX IF NOT EXISTS idx_shopee_shops_status ON shopee_shops(status);

-- Enable RLS
ALTER TABLE shopee_shops ENABLE ROW LEVEL SECURITY;

-- Basic policies (will be updated by later migrations)
CREATE POLICY "Admin can manage shopee shops" ON shopee_shops
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can view shopee shops" ON shopee_shops
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid()
        )
    );