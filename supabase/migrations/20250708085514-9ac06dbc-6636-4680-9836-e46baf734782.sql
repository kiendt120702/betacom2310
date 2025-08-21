
-- Thêm enum cho trạng thái duyệt banner
CREATE TYPE public.banner_status AS ENUM ('pending', 'approved', 'rejected');

-- Thêm cột status vào bảng banners
ALTER TABLE public.banners ADD COLUMN status public.banner_status DEFAULT 'pending';

-- Cập nhật tất cả banner hiện tại thành approved (để không ảnh hưởng đến dữ liệu hiện có)
UPDATE public.banners SET status = 'approved';

-- Thêm cột approved_by để lưu admin đã duyệt
ALTER TABLE public.banners ADD COLUMN approved_by uuid REFERENCES auth.users(id);

-- Thêm cột approved_at để lưu thời gian duyệt
ALTER TABLE public.banners ADD COLUMN approved_at timestamp with time zone;

-- Cập nhật RLS policies cho banners
DROP POLICY IF EXISTS "Users can view all active banners" ON banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON banners;
DROP POLICY IF EXISTS "Admins can update banners" ON banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON banners;

-- Policy mới: Users chỉ xem được banner đã được duyệt
CREATE POLICY "Users can view approved banners" 
  ON banners 
  FOR SELECT 
  USING (status = 'approved' AND auth.uid() IS NOT NULL);

-- Policy mới: Admin xem được tất cả banner
CREATE POLICY "Admins can view all banners" 
  ON banners 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin');

-- Policy mới: Chuyên viên và Leader có thể thêm banner (trạng thái pending)
CREATE POLICY "Users can insert pending banners" 
  ON banners 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND (get_user_role(auth.uid()) IN ('admin', 'leader', 'chuyên viên'))
    AND (status = 'pending' OR get_user_role(auth.uid()) = 'admin')
  );

-- Policy mới: Admin có thể cập nhật tất cả banner, user chỉ có thể cập nhật banner pending của mình
CREATE POLICY "Users can update their own pending banners or admins can update all" 
  ON banners 
  FOR UPDATE 
  USING (
    get_user_role(auth.uid()) = 'admin' 
    OR (user_id = auth.uid() AND status = 'pending')
  );

-- Policy mới: Admin có thể xóa tất cả banner, user chỉ có thể xóa banner pending của mình
CREATE POLICY "Users can delete their own pending banners or admins can delete all" 
  ON banners 
  FOR DELETE 
  USING (
    get_user_role(auth.uid()) = 'admin' 
    OR (user_id = auth.uid() AND status = 'pending')
  );

-- Cập nhật function search_banners để hỗ trợ filter theo status
CREATE OR REPLACE FUNCTION search_banners(
  search_term text DEFAULT '',
  category_filter uuid DEFAULT NULL,
  type_filter uuid DEFAULT NULL,
  status_filter text DEFAULT 'approved',
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 18
)
RETURNS TABLE(
  id uuid,
  name text,
  image_url text,
  canva_link text,
  created_at timestamptz,
  updated_at timestamptz,
  category_name text,
  banner_type_name text,
  status text,
  user_name text,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
  total_records bigint;
BEGIN
  -- Get total count first
  SELECT COUNT(*) INTO total_records
  FROM banners b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN banner_types bt ON b.banner_type_id = bt.id
  LEFT JOIN profiles p ON b.user_id = p.id
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter)
    AND (status_filter = 'all' OR b.status::text = status_filter)
    AND (
      -- Admin xem tất cả
      get_user_role(auth.uid()) = 'admin' 
      -- User thường chỉ xem approved
      OR (get_user_role(auth.uid()) != 'admin' AND b.status = 'approved')
    );

  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.image_url,
    b.canva_link,
    b.created_at,
    b.updated_at,
    c.name as category_name,
    bt.name as banner_type_name,
    b.status::text,
    COALESCE(p.full_name, p.email) as user_name,
    total_records
  FROM banners b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN banner_types bt ON b.banner_type_id = bt.id
  LEFT JOIN profiles p ON b.user_id = p.id
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter)
    AND (status_filter = 'all' OR b.status::text = status_filter)
    AND (
      -- Admin xem tất cả
      get_user_role(auth.uid()) = 'admin' 
      -- User thường chỉ xem approved
      OR (get_user_role(auth.uid()) != 'admin' AND b.status = 'approved')
    )
  ORDER BY 
    CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
    b.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;
