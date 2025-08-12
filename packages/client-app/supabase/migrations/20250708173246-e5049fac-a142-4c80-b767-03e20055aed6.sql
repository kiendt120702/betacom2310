
-- Tạo indexes cho foreign keys để tối ưu hiệu suất
CREATE INDEX IF NOT EXISTS idx_banners_user_id ON banners(user_id);
CREATE INDEX IF NOT EXISTS idx_banners_category_id ON banners(category_id);
CREATE INDEX IF NOT EXISTS idx_banners_banner_type_id ON banners(banner_type_id);
CREATE INDEX IF NOT EXISTS idx_banners_approved_by ON banners(approved_by);

-- Tạo indexes cho chat tables
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_general_chat_messages_conversation_id ON general_chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_seo_chat_messages_conversation_id ON seo_chat_messages(conversation_id);

-- Tạo indexes cho profiles
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Tạo indexes cho system_updates
CREATE INDEX IF NOT EXISTS idx_system_updates_created_by ON system_updates(created_by);

-- Tối ưu hóa function search_banners để tránh function calls không cần thiết
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
  current_user_role user_role;
BEGIN
  -- Lấy role một lần duy nhất
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  
  -- Sử dụng window function để tính total_count chỉ một lần
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
      current_user_role = 'admin' 
      -- User thường chỉ xem approved
      OR (current_user_role != 'admin' AND b.status = 'approved')
    )
  ORDER BY 
    CASE WHEN b.status = 'pending' THEN 0 ELSE 1 END,
    b.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- Tạo function để cache user role cho session
CREATE OR REPLACE FUNCTION get_cached_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cached_role user_role;
BEGIN
  -- Sử dụng pg_advisory_xact_lock để đảm bảo thread safety
  PERFORM pg_advisory_xact_lock(hashtext('user_role_' || auth.uid()::text));
  
  SELECT role INTO cached_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(cached_role, 'chuyên viên'::user_role);
END;
$$;

-- Cập nhật các RLS policies để sử dụng cached function
DROP POLICY IF EXISTS "Admins can view all banners" ON banners;
CREATE POLICY "Admins can view all banners" 
  ON banners 
  FOR SELECT 
  USING (get_cached_user_role() = 'admin');

DROP POLICY IF EXISTS "Users can delete their own pending banners or admins can delete" ON banners;
CREATE POLICY "Users can delete their own pending banners or admins can delete" 
  ON banners 
  FOR DELETE 
  USING (
    get_cached_user_role() = 'admin' 
    OR (user_id = auth.uid() AND status = 'pending')
  );

DROP POLICY IF EXISTS "Users can update their own pending banners or admins can update" ON banners;
CREATE POLICY "Users can update their own pending banners or admins can update" 
  ON banners 
  FOR UPDATE 
  USING (
    get_cached_user_role() = 'admin' 
    OR (user_id = auth.uid() AND status = 'pending')
  );

-- Tạo materialized view cho statistics để tăng hiệu suất
CREATE MATERIALIZED VIEW IF NOT EXISTS banner_statistics AS
SELECT 
  COUNT(*) as total_banners,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_banners,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_banners,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_banners,
  COUNT(DISTINCT user_id) as total_users,
  COUNT(DISTINCT category_id) as total_categories,
  COUNT(DISTINCT banner_type_id) as total_banner_types
FROM banners;

-- Tạo function để refresh materialized view
CREATE OR REPLACE FUNCTION refresh_banner_statistics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW banner_statistics;
END;
$$;

-- Tạo trigger để tự động refresh statistics khi có thay đổi
CREATE OR REPLACE FUNCTION trigger_refresh_banner_statistics()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sử dụng pg_notify để refresh async
  PERFORM pg_notify('refresh_stats', 'banners');
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS banner_stats_trigger ON banners;
CREATE TRIGGER banner_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON banners
  FOR EACH ROW EXECUTE FUNCTION trigger_refresh_banner_statistics();

-- Tạo index cho search performance
CREATE INDEX IF NOT EXISTS idx_banners_search_name ON banners USING gin(to_tsvector('simple', name));
CREATE INDEX IF NOT EXISTS idx_banners_composite_search ON banners(status, created_at DESC) WHERE status = 'approved';

-- Tạo partial indexes cho các trường hợp thường xuyên query
CREATE INDEX IF NOT EXISTS idx_banners_pending ON banners(created_at DESC) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_banners_approved ON banners(created_at DESC) WHERE status = 'approved';
