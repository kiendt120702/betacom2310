
-- Tạo bảng leaders (quản lý leader)
CREATE TABLE public.leaders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng personnel (nhân sự)
CREATE TABLE public.personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  leader_id UUID REFERENCES public.leaders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng shops
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  personnel_id UUID REFERENCES public.personnel(id) ON DELETE SET NULL,
  leader_id UUID REFERENCES public.leaders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng sales_reports (báo cáo doanh số)
CREATE TABLE public.sales_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_sales BIGINT NOT NULL DEFAULT 0,
  upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, month, year)
);

-- Tạo bảng daily_sales (doanh số theo ngày)
CREATE TABLE public.daily_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE NOT NULL,
  sale_date DATE NOT NULL,
  amount BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shop_id, sale_date)
);

-- Enable RLS cho tất cả các bảng
ALTER TABLE public.leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sales ENABLE ROW LEVEL SECURITY;

-- RLS policies cho leaders
CREATE POLICY "Admins can manage leaders" ON public.leaders
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view leaders" ON public.leaders
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS policies cho personnel
CREATE POLICY "Admins can manage personnel" ON public.personnel
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view personnel" ON public.personnel
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS policies cho shops
CREATE POLICY "Admins can manage shops" ON public.shops
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view shops" ON public.shops
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- RLS policies cho sales_reports
CREATE POLICY "Admins can manage sales reports" ON public.sales_reports
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view sales reports" ON public.sales_reports
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert their own sales reports" ON public.sales_reports
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- RLS policies cho daily_sales
CREATE POLICY "Admins can manage daily sales" ON public.daily_sales
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view daily sales" ON public.daily_sales
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Tạo indexes để tối ưu hóa truy vấn
CREATE INDEX idx_personnel_leader_id ON public.personnel(leader_id);
CREATE INDEX idx_shops_personnel_id ON public.shops(personnel_id);
CREATE INDEX idx_shops_leader_id ON public.shops(leader_id);
CREATE INDEX idx_sales_reports_shop_id ON public.sales_reports(shop_id);
CREATE INDEX idx_sales_reports_month_year ON public.sales_reports(month, year);
CREATE INDEX idx_daily_sales_shop_id ON public.daily_sales(shop_id);
CREATE INDEX idx_daily_sales_date ON public.daily_sales(sale_date);
