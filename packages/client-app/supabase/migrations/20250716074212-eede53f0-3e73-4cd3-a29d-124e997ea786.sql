
-- Tạo bảng lưu lịch sử sản phẩm đã thêm
CREATE TABLE public.product_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm RLS cho bảng product_history
ALTER TABLE public.product_history ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user xem lịch sử của mình
CREATE POLICY "Users can view their own product history" 
  ON public.product_history 
  FOR SELECT 
  USING (user_id = auth.uid());

-- Policy cho phép user thêm lịch sử
CREATE POLICY "Users can create their own product history" 
  ON public.product_history 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Policy cho phép user xóa lịch sử của mình  
CREATE POLICY "Users can delete their own product history" 
  ON public.product_history 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Tạo index để tối ưu truy vấn
CREATE INDEX idx_product_history_user_id_created_at ON public.product_history(user_id, created_at DESC);
