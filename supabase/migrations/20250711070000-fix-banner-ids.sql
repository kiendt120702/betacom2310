
-- Update search_banners function to return actual IDs
CREATE OR REPLACE FUNCTION public.search_banners(
  search_term text DEFAULT ''::text, 
  category_filter uuid DEFAULT NULL::uuid, 
  type_filter uuid DEFAULT NULL::uuid, 
  status_filter text DEFAULT 'approved'::text, 
  page_num integer DEFAULT 1, 
  page_size integer DEFAULT 18
)
RETURNS TABLE(
  id uuid, 
  name text, 
  image_url text, 
  canva_link text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  category_name text, 
  banner_type_name text, 
  category_id uuid,
  banner_type_id uuid,
  status text, 
  user_name text, 
  total_count bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    c.id as category_id,
    bt.id as banner_type_id,
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
$function$
