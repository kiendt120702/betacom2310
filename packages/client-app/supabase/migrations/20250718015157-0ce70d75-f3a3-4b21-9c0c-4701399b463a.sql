
-- Tạo bảng để lưu trữ các chiến lược Shopee có cấu trúc
CREATE TABLE public.shopee_strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- Công thức A1, Công thức A, Ngành hàng áp dụng
  industry TEXT NOT NULL, -- Thời trang, Gia dụng, etc.
  target_audience TEXT NOT NULL, -- Nam/Nữ, độ tuổi
  objective TEXT NOT NULL, -- Mục tiêu chính của chiến lược
  strategy_steps TEXT[] NOT NULL, -- Các bước thực hiện chi tiết
  benefits TEXT[] NOT NULL, -- Lợi ích mang lại
  kpis TEXT[] NOT NULL, -- Các chỉ số đo lường
  explanation TEXT NOT NULL, -- Giải thích chi tiết chiến lược
  context_info TEXT, -- Thông tin ngữ cảnh bổ sung
  tags TEXT[] DEFAULT '{}', -- Tags để tìm kiếm
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5), -- Độ khó 1-5
  estimated_time TEXT, -- Thời gian thực hiện ước tính
  success_rate INTEGER DEFAULT 0 CHECK (success_rate >= 0 AND success_rate <= 100), -- Tỷ lệ thành công %
  content_embedding VECTOR(1536), -- Vector embedding cho RAG
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users DEFAULT auth.uid()
);

-- Tạo bảng categories cho chiến lược
CREATE TABLE public.strategy_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6', -- Màu hiển thị
  icon TEXT DEFAULT 'target', -- Icon lucide
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng industries
CREATE TABLE public.strategy_industries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm các categories mặc định
INSERT INTO public.strategy_categories (name, description, color, icon) VALUES
  ('Công thức A1', 'Chiến lược cơ bản cho người mới bắt đầu', '#10B981', 'play-circle'),
  ('Công thức A', 'Chiến lược nâng cao cho seller có kinh nghiệm', '#3B82F6', 'target'),
  ('Ngành hàng áp dụng', 'Chiến lược chuyên biệt theo từng ngành hàng', '#8B5CF6', 'briefcase');

-- Thêm các industries mặc định
INSERT INTO public.strategy_industries (name, description) VALUES
  ('Thời trang', 'Quần áo, giày dép, phụ kiện thời trang'),
  ('Gia dụng', 'Đồ dùng gia đình, nội thất'),
  ('Điện tử', 'Thiết bị điện tử, máy tính, phụ kiện'),
  ('Làm đẹp', 'Mỹ phẩm, chăm sóc da, làm đẹp'),
  ('Thực phẩm', 'Đồ ăn, thức uống, thực phẩm chức năng'),
  ('Tất cả ngành hàng', 'Áp dụng cho mọi loại sản phẩm');

-- Bảng để lưu feedback và đánh giá chiến lược
CREATE TABLE public.strategy_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  strategy_id UUID REFERENCES public.shopee_strategies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  is_helpful BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo RLS policies
ALTER TABLE public.shopee_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategy_feedback ENABLE ROW LEVEL SECURITY;

-- Policies cho shopee_strategies
CREATE POLICY "Anyone can view strategies" ON public.shopee_strategies
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage strategies" ON public.shopee_strategies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies cho categories và industries
CREATE POLICY "Anyone can view categories" ON public.strategy_categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.strategy_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view industries" ON public.strategy_industries
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage industries" ON public.strategy_industries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policies cho feedback
CREATE POLICY "Users can view all feedback" ON public.strategy_feedback
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own feedback" ON public.strategy_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON public.strategy_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Tạo indexes để tối ưu tìm kiếm
CREATE INDEX idx_shopee_strategies_category ON public.shopee_strategies(category);
CREATE INDEX idx_shopee_strategies_industry ON public.shopee_strategies(industry);
CREATE INDEX idx_shopee_strategies_tags ON public.shopee_strategies USING GIN(tags);
CREATE INDEX idx_shopee_strategies_embedding ON public.shopee_strategies USING hnsw (content_embedding vector_cosine_ops);

-- Function tìm kiếm chiến lược với vector similarity
CREATE OR REPLACE FUNCTION search_shopee_strategies(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.8,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  industry TEXT,
  objective TEXT,
  explanation TEXT,
  difficulty_level INTEGER,
  success_rate INTEGER,
  similarity FLOAT
)
LANGUAGE SQL
STABLE
AS $$
  SELECT
    shopee_strategies.id,
    shopee_strategies.title,
    shopee_strategies.category,
    shopee_strategies.industry,
    shopee_strategies.objective,
    shopee_strategies.explanation,
    shopee_strategies.difficulty_level,
    shopee_strategies.success_rate,
    1 - (shopee_strategies.content_embedding <=> query_embedding) as similarity
  FROM shopee_strategies
  WHERE shopee_strategies.content_embedding IS NOT NULL
    AND 1 - (shopee_strategies.content_embedding <=> query_embedding) > match_threshold
  ORDER BY shopee_strategies.content_embedding <=> query_embedding
  LIMIT match_count;
$$;
