-- Tạo hàm đặc biệt để xác định người dùng Trương Thị Quỳnh
CREATE OR REPLACE FUNCTION public.is_special_viewer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND full_name = 'Trương Thị Quỳnh'
  );
$$;

-- Xóa các chính sách cũ trên bảng tiktok_shops để tránh xung đột
DROP POLICY IF EXISTS "Tiktok shops access control" ON public.tiktok_shops;
DROP POLICY IF EXISTS "Admins have full access to tiktok shops" ON public.tiktok_shops;
DROP POLICY IF EXISTS "Leaders can view their team's tiktok shops" ON public.tiktok_shops;
DROP POLICY IF EXISTS "Users can view and manage their own tiktok shops" ON public.tiktok_shops;

-- Chính sách CHO PHÉP XEM (SELECT)
CREATE POLICY "Tiktok shops SELECT access" ON public.tiktok_shops
FOR SELECT TO authenticated
USING (
  -- Admin, Trưởng phòng, và người dùng đặc biệt có thể xem tất cả
  (get_user_role(auth.uid()) IN ('admin'::user_role, 'trưởng phòng'::user_role)) OR
  (public.is_special_viewer()) OR
  -- Leader có thể xem shop của team mình
  (
    get_user_role(auth.uid()) = 'leader'::user_role AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = tiktok_shops.profile_id AND p.manager_id = auth.uid()
    )
  ) OR
  -- Người dùng có thể xem shop của chính mình
  (profile_id = auth.uid())
);

-- Chính sách cho các hành động GHI (INSERT, UPDATE, DELETE)
CREATE POLICY "Tiktok shops MUTATE access" ON public.tiktok_shops
FOR ALL TO authenticated
USING (
  -- Admin có thể sửa/xóa bất kỳ shop nào
  (get_user_role(auth.uid()) = 'admin'::user_role) OR
  -- Người dùng có thể sửa/xóa shop của chính mình
  (profile_id = auth.uid())
)
WITH CHECK (
  -- Admin có thể tạo/sửa bất kỳ shop nào
  (get_user_role(auth.uid()) = 'admin'::user_role) OR
  -- Người dùng có thể tạo/sửa shop của chính mình
  (profile_id = auth.uid())
);