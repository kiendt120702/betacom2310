
-- Thêm indexes để tối ưu hiệu suất search và pagination
CREATE INDEX IF NOT EXISTS idx_banners_category_id ON banners(category_id);
CREATE INDEX IF NOT EXISTS idx_banners_banner_type_id ON banners(banner_type_id);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_banners_name_search ON banners USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_banners_user_id ON banners(user_id);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_banners_filters ON banners(category_id, banner_type_id, created_at DESC);

-- Cải thiện RLS policies để đảm bảo performance và security
DROP POLICY IF EXISTS "Authenticated users can view all banners" ON banners;
CREATE POLICY "Users can view all active banners" 
  ON banners 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Thêm function để optimize banner search với full-text search
CREATE OR REPLACE FUNCTION search_banners(
  search_term text DEFAULT '',
  category_filter uuid DEFAULT NULL,
  type_filter uuid DEFAULT NULL,
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
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter);

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
    total_records
  FROM banners b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN banner_types bt ON b.banner_type_id = bt.id
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter)
  ORDER BY b.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;
