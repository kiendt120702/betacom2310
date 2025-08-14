
-- Create table for shop revenue data
CREATE TABLE shop_revenue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES shops(id),
  revenue_date DATE NOT NULL,
  total_revenue DECIMAL(15,2) NOT NULL,
  total_orders INTEGER NOT NULL,
  revenue_before_discount DECIMAL(15,2) NOT NULL,
  shopee_commission DECIMAL(15,2) NOT NULL,
  commission_orders INTEGER NOT NULL,
  conversion_rate DECIMAL(5,2) NOT NULL,
  click_through_orders INTEGER NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE shop_revenue ENABLE ROW LEVEL SECURITY;

-- Admins can manage all shop revenue
CREATE POLICY "Admins can manage all shop revenue" ON shop_revenue
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Users can manage revenue for their shops
CREATE POLICY "Users can manage revenue for their shops" ON shop_revenue
  FOR ALL USING (
    shop_id IN (
      SELECT id FROM shops WHERE user_id = auth.uid()
    )
  );

-- Leaders can view revenue for their team's shops
CREATE POLICY "Leaders can view revenue for their team's shops" ON shop_revenue
  FOR SELECT USING (
    shop_id IN (
      SELECT id FROM shops WHERE leader_id = auth.uid()
    )
  );
