-- 1. Xóa các chính sách bảo mật cũ trên bảng tiktok_shops để tránh xung đột
DROP POLICY IF EXISTS "Admin can manage tiktok shops" ON public.tiktok_shops;
DROP POLICY IF EXISTS "Leaders can view all tiktok shops" ON public.tiktok_shops;
DROP POLICY IF EXISTS "Restrict tiktok_shop access to authorized users" ON public.tiktok_shops;

-- 2. Tạo các chính sách mới, rõ ràng và chặt chẽ hơn
-- Chính sách cho phép Admin toàn quyền truy cập
CREATE POLICY "Admins have full access to tiktok shops"
ON public.tiktok_shops
FOR ALL
TO authenticated
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Chính sách cho phép Leader và Trưởng phòng xem shop của thành viên trong nhóm và của chính họ
CREATE POLICY "Leaders can view their team's tiktok shops"
ON public.tiktok_shops
FOR SELECT
TO authenticated
USING (
  (get_user_role(auth.uid()) IN ('leader'::user_role, 'trưởng phòng'::user_role)) AND
  (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = tiktok_shops.profile_id AND p.manager_id = auth.uid()
  )) OR (profile_id = auth.uid())
);

-- Chính sách cho phép người dùng (bao gồm Chuyên viên) xem và quản lý shop được gán cho họ
CREATE POLICY "Users can view and manage their own tiktok shops"
ON public.tiktok_shops
FOR ALL
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());