-- Xóa các chính sách cũ và không chính xác
DROP POLICY IF EXISTS "Admin can manage tiktok reports" ON public.tiktok_comprehensive_reports;
DROP POLICY IF EXISTS "Restrict tiktok_report access based on shop access" ON public.tiktok_comprehensive_reports;

-- Tạo một chính sách mới, toàn diện để kiểm soát quyền truy cập
CREATE POLICY "Restrict tiktok report access based on shop ownership and role"
ON public.tiktok_comprehensive_reports
FOR ALL
TO authenticated
USING (
  -- Quy tắc 1: Admin có thể xem tất cả báo cáo
  (get_user_role(auth.uid()) = 'admin'::user_role)
  OR
  -- Quy tắc 2: Người dùng có thể xem báo cáo của các shop được gán cho họ
  (EXISTS (
    SELECT 1
    FROM public.tiktok_shops s
    WHERE s.id = tiktok_comprehensive_reports.shop_id
      AND s.profile_id = auth.uid()
  ))
  OR
  -- Quy tắc 3: Leader và Trưởng phòng có thể xem báo cáo của các shop thuộc thành viên trong nhóm họ quản lý
  (
    (get_user_role(auth.uid()) IN ('leader'::user_role, 'trưởng phòng'::user_role))
    AND
    (EXISTS (
      SELECT 1
      FROM public.tiktok_shops s
      JOIN public.profiles p ON s.profile_id = p.id
      WHERE s.id = tiktok_comprehensive_reports.shop_id
        AND p.manager_id = auth.uid()
    ))
  )
)
WITH CHECK (
  -- Chỉ Admin mới có quyền tạo, sửa, xóa báo cáo
  (get_user_role(auth.uid()) = 'admin'::user_role)
);