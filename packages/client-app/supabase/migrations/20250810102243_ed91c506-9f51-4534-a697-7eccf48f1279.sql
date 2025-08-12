
-- Tạo enum cho hình thức làm việc
CREATE TYPE public.work_type AS ENUM ('fulltime', 'parttime');

-- Tạo bảng quản lý vai trò
CREATE TABLE public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm cột phone và work_type vào bảng profiles
ALTER TABLE public.profiles 
ADD COLUMN phone TEXT,
ADD COLUMN work_type work_type DEFAULT 'fulltime';

-- Thêm RLS policies cho bảng roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all roles" 
  ON public.roles 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Authenticated users can view roles" 
  ON public.roles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Thêm một số vai trò mặc định
INSERT INTO public.roles (name, description) VALUES 
  ('Admin', 'Quản trị viên hệ thống'),
  ('Leader', 'Trưởng nhóm'),
  ('Chuyên viên', 'Nhân viên chuyên môn'),
  ('Thực tập sinh', 'Nhân viên thực tập');
