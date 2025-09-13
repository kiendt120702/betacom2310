
-- Thêm enum cho role
CREATE TYPE public.user_role AS ENUM ('admin', 'leader', 'chuyên viên');

-- Thêm cột role vào bảng profiles
ALTER TABLE public.profiles ADD COLUMN role public.user_role DEFAULT 'chuyên viên';

-- Cập nhật role admin cho user betacom.work@gmail.com
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'betacom.work@gmail.com';

-- Tạo function để check role của user
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Cập nhật RLS policies cho banners table để chỉ admin mới có quyền thêm/sửa/xóa
DROP POLICY IF EXISTS "Users can create their own banners" ON public.banners;
DROP POLICY IF EXISTS "Users can update their own banners" ON public.banners;
DROP POLICY IF EXISTS "Users can delete their own banners" ON public.banners;

-- Policy mới: Admin có thể thêm banner
CREATE POLICY "Admin can create banners" 
  ON public.banners 
  FOR INSERT 
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Policy mới: Admin có thể cập nhật banner
CREATE POLICY "Admin can update banners" 
  ON public.banners 
  FOR UPDATE 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Policy mới: Admin có thể xóa banner
CREATE POLICY "Admin can delete banners" 
  ON public.banners 
  FOR DELETE 
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Policy xem banner: Tất cả user đã đăng nhập có thể xem
DROP POLICY IF EXISTS "Users can view their own banners" ON public.banners;
CREATE POLICY "Authenticated users can view all banners" 
  ON public.banners 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);
