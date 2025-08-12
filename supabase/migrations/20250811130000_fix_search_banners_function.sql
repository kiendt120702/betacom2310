-- Drop all existing search_banners functions to resolve conflicts
DROP FUNCTION IF EXISTS public.search_banners(text, uuid, uuid, text, integer, integer);
DROP FUNCTION IF EXISTS public.search_banners(text, uuid, uuid, text, text, integer, integer);

-- Create the correct search_banners function with proper column references
CREATE OR REPLACE FUNCTION public.search_banners(
  search_term text DEFAULT ''::text, 
  category_filter uuid DEFAULT NULL::uuid, 
  type_filter uuid DEFAULT NULL::uuid, 
  status_filter text DEFAULT 'approved'::text,
  sort_by text DEFAULT 'created_desc'::text,
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
  category_id uuid,
  category_name text, 
  banner_type_id uuid,
  banner_type_name text, 
  status text, 
  user_name text, 
  total_count bigint
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
  current_user_role user_role;
BEGIN
  -- Get user role once
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  
  -- Return query with proper column references
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.image_url,
    b.canva_link,
    b.created_at,
    b.updated_at,
    b.category_id,
    c.name as category_name,
    b.banner_type_id,
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
      -- Admin sees all
      current_user_role = 'admin' 
      -- Regular users only see approved
      OR (current_user_role != 'admin' AND b.status = 'approved')
    )
  ORDER BY 
    -- Priority for pending items for admins
    CASE WHEN current_user_role = 'admin' AND b.status = 'pending' THEN 0 ELSE 1 END,
    -- Dynamic sorting based on sort_by parameter
    CASE 
      WHEN sort_by = 'created_desc' THEN b.created_at END DESC,
    CASE 
      WHEN sort_by = 'created_asc' THEN b.created_at END ASC,
    CASE 
      WHEN sort_by = 'name_desc' THEN b.name END DESC,
    CASE 
      WHEN sort_by = 'name_asc' THEN b.name END ASC,
    CASE 
      WHEN sort_by NOT IN ('created_desc', 'created_asc', 'name_desc', 'name_asc') THEN b.created_at END DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;