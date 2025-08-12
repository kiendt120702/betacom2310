
-- Thêm index cho banners.status để tối ưu filtering theo status
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);

-- Thêm composite index cho user_id và status để tối ưu queries phức tạp
CREATE INDEX IF NOT EXISTS idx_banners_user_status ON banners(user_id, status);

-- Thêm composite index cho các filter thường dùng nhất
CREATE INDEX IF NOT EXISTS idx_banners_category_type_status ON banners(category_id, banner_type_id, status, created_at DESC);

-- Tối ưu search function để giảm thiểu việc COUNT hai lần
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
BEGIN
  -- Sử dụng window function để tính total_count chỉ một lần thay vì COUNT riêng
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
    COUNT(*) OVER() as total_count
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
