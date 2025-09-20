-- Xóa chính sách cũ trên bảng báo cáo
DROP POLICY IF EXISTS "Tiktok reports access control" ON public.tiktok_comprehensive_reports;

-- Chính sách CHO PHÉP XEM (SELECT) báo cáo
CREATE POLICY "Tiktok reports SELECT access" ON public.tiktok_comprehensive_reports
FOR SELECT TO authenticated
USING (
  -- Admin, Trưởng phòng, và người dùng đặc biệt có thể xem tất cả
  (get_user_role(auth.uid()) IN ('admin'::user_role, 'trưởng phòng'::user_role)) OR
  (public.is_special_viewer()) OR
  -- Leader có thể xem báo cáo của team mình
  (
    get_user_role(auth.uid()) = 'leader'::user_role AND
    EXISTS (
      SELECT 1
      FROM public.tiktok_shops s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE s.id = tiktok_comprehensive_reports.shop_id
        AND p.manager_id = auth.uid()
    )
  ) OR
  -- Người dùng có thể xem báo cáo của shop mình
  (EXISTS (
    SELECT 1
    FROM public.tiktok_shops s
    WHERE s.id = tiktok_comprehensive_reports.shop_id
      AND s.profile_id = auth.uid()
  ))
);

-- Chính sách cho các hành động GHI (INSERT, UPDATE, DELETE) báo cáo
CREATE POLICY "Tiktok reports MUTATE access" ON public.tiktok_comprehensive_reports
FOR ALL TO authenticated
USING (
  -- Chỉ Admin mới có quyền sửa/xóa báo cáo
  (get_user_role(auth.uid()) = 'admin'::user_role)
)
WITH CHECK (
  -- Chỉ Admin mới có quyền tạo/sửa báo cáo
  (get_user_role(auth.uid()) = 'admin'::user_role)
);