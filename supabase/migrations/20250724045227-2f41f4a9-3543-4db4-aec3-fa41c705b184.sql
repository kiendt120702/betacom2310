
-- Tạo bảng để lưu trữ chiến lược của người dùng
CREATE TABLE public.strategies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  strategy TEXT NOT NULL,
  implementation TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo RLS để đảm bảo user chỉ có thể xem và chỉnh sửa chiến lược của mình
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- Policy để user có thể xem chiến lược của mình
CREATE POLICY "Users can view their own strategies" ON public.strategies
  FOR SELECT USING (auth.uid() = user_id);

-- Policy để user có thể tạo chiến lược của mình
CREATE POLICY "Users can create their own strategies" ON public.strategies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy để user có thể cập nhật chiến lược của mình
CREATE POLICY "Users can update their own strategies" ON public.strategies
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy để user có thể xóa chiến lược của mình
CREATE POLICY "Users can delete their own strategies" ON public.strategies
  FOR DELETE USING (auth.uid() = user_id);

-- Tạo trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_strategies_updated_at 
    BEFORE UPDATE ON public.strategies 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
