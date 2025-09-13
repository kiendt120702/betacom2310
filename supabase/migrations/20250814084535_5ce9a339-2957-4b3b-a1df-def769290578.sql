
-- Create table for storing daily shop revenue
-- Note: Foreign key to shops table removed as it doesn't exist
CREATE TABLE IF NOT EXISTS public.shop_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL,
  revenue_date DATE NOT NULL,
  revenue_amount NUMERIC NOT NULL DEFAULT 0,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique entry per shop per date
  UNIQUE(shop_id, revenue_date)
);

-- Enable RLS
ALTER TABLE public.shop_revenue ENABLE ROW LEVEL SECURITY;

-- RLS policies for shop_revenue
-- Note: Simplified policies since shops table doesn't exist
CREATE POLICY "Users can manage revenue they uploaded" ON public.shop_revenue
  FOR ALL USING (uploaded_by = auth.uid());

CREATE POLICY "Admins can manage all shop revenue" ON public.shop_revenue
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shop_revenue_shop_date ON public.shop_revenue(shop_id, revenue_date);
CREATE INDEX IF NOT EXISTS idx_shop_revenue_date ON public.shop_revenue(revenue_date);
