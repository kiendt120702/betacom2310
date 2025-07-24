
-- Tạo bảng strategies để lưu trữ chiến lược
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  strategy TEXT NOT NULL,
  implementation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm RLS (Row Level Security) để đảm bảo users chỉ có thể xem và quản lý chiến lược của họ
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Policy cho phép users xem chiến lược của họ
CREATE POLICY "Users can view their own strategies" 
  ON public.strategies 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy cho phép users tạo chiến lược của họ
CREATE POLICY "Users can create their own strategies" 
  ON public.strategies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy cho phép users cập nhật chiến lược của họ
CREATE POLICY "Users can update their own strategies" 
  ON public.strategies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy cho phép users xóa chiến lược của họ
CREATE POLICY "Users can delete their own strategies" 
  ON public.strategies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Tạo index để tối ưu hiệu suất truy vấn
CREATE INDEX idx_strategies_user_id ON public.strategies(user_id);
CREATE INDEX idx_strategies_created_at ON public.strategies(created_at DESC);
