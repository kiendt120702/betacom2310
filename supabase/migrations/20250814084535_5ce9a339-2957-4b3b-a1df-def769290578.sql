
-- Create table for storing daily shop revenue
CREATE TABLE IF NOT EXISTS public.shop_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
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
CREATE POLICY "Users can manage revenue for their shops" ON public.shop_revenue
  FOR ALL USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can view revenue for their team's shops" ON public.shop_revenue
  FOR SELECT USING (
    shop_id IN (
      SELECT id FROM public.shops WHERE leader_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all shop revenue" ON public.shop_revenue
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shop_revenue_shop_date ON public.shop_revenue(shop_id, revenue_date);
CREATE INDEX IF NOT EXISTS idx_shop_revenue_date ON public.shop_revenue(revenue_date);
