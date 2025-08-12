
-- Create banner_types table
CREATE TABLE public.banner_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  canva_link TEXT,
  banner_type_id UUID REFERENCES public.banner_types(id) NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for all tables
ALTER TABLE public.banner_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- RLS policies for banner_types (public read, authenticated users can manage)
CREATE POLICY "Anyone can view banner types" 
  ON public.banner_types 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage banner types" 
  ON public.banner_types 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for categories (public read, authenticated users can manage)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage categories" 
  ON public.categories 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for banners (users can only see and manage their own banners)
CREATE POLICY "Users can view their own banners" 
  ON public.banners 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own banners" 
  ON public.banners 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own banners" 
  ON public.banners 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own banners" 
  ON public.banners 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Insert default banner types
INSERT INTO public.banner_types (name) VALUES 
('Ảnh bìa'),
('Banner'),
('Ảnh thành phần');

-- Insert some default categories
INSERT INTO public.categories (name) VALUES 
('Thời Trang Trẻ Em'),
('Thời Trang Nữ'),
('Thời Trang Nam'),
('Điện Tử'),
('Gia Dụng'),
('Thực Phẩm'),
('Làm Đẹp'),
('Thể Thao');
