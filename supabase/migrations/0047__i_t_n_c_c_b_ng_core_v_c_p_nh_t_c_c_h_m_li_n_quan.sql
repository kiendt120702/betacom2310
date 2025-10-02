-- Đổi tên các bảng
ALTER TABLE public.departments RENAME TO sys_departments;
ALTER TABLE public.feedback RENAME TO sys_feedback;
ALTER TABLE public.profiles RENAME TO sys_profiles;
ALTER TABLE public.roles RENAME TO sys_roles;
ALTER TABLE public.page_views RENAME TO sys_page_views;

-- Cập nhật các hàm (functions)
CREATE OR REPLACE FUNCTION public.get_daily_page_views(start_date_param timestamp with time zone, end_date_param timestamp with time zone)
 RETURNS TABLE(date date, view_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        DATE(created_at) AS date,
        COUNT(id) AS view_count
    FROM public.sys_page_views
    WHERE created_at BETWEEN start_date_param AND end_date_param
    GROUP BY DATE(created_at)
    ORDER BY date;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_top_pages(start_date_param timestamp with time zone, end_date_param timestamp with time zone, limit_param integer DEFAULT 10)
 RETURNS TABLE(path text, view_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        pv.path,
        COUNT(pv.id) as view_count
    FROM public.sys_page_views pv
    WHERE pv.created_at BETWEEN start_date_param AND end_date_param
    GROUP BY pv.path
    ORDER BY view_count DESC
    LIMIT limit_param;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_top_users_by_page_views(start_date_param timestamp with time zone, end_date_param timestamp with time zone, page_num integer DEFAULT 1, page_size integer DEFAULT 10)
 RETURNS TABLE(user_id uuid, user_name text, view_count bigint, total_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
BEGIN
    RETURN QUERY
    WITH user_views AS (
        SELECT
            pv.user_id,
            COUNT(pv.id) AS views
        FROM public.sys_page_views pv
        WHERE pv.created_at BETWEEN start_date_param AND end_date_param
        GROUP BY pv.user_id
    )
    SELECT
        uv.user_id,
        COALESCE(p.full_name, p.email) AS user_name,
        uv.views AS view_count,
        COUNT(*) OVER() as total_count
    FROM user_views uv
    LEFT JOIN public.sys_profiles p ON uv.user_id = p.id
    ORDER BY view_count DESC
    LIMIT page_size
    OFFSET offset_val;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT json_agg(shops_with_details)
    FROM (
        SELECT
            ts.*,
            (
                SELECT jsonb_build_object(
                    'id', p.id,
                    'full_name', p.full_name,
                    'email', p.email,
                    'team_id', p.team_id,
                    'manager_id', p.manager_id,
                    'manager', (
                        SELECT jsonb_build_object(
                            'id', m.id,
                            'full_name', m.full_name,
                            'email', m.email
                        )
                        FROM public.sys_profiles m
                        WHERE m.id = p.manager_id
                    )
                )
                FROM public.sys_profiles p
                WHERE p.id = ts.profile_id
            ) as profile
        FROM public.tiktok_shops ts
        WHERE
            (
                (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'trưởng phòng'::user_role])) OR 
                is_special_viewer() OR 
                (
                    (get_user_role(auth.uid()) = 'leader'::user_role) AND 
                    (EXISTS (SELECT 1 FROM sys_profiles p WHERE p.id = ts.profile_id AND p.manager_id = auth.uid()))
                ) OR 
                (ts.profile_id = auth.uid())
            )
    ) as shops_with_details;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS user_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT role FROM public.sys_profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_team_id(user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT team_id FROM public.sys_profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.sys_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'chuyên viên'::public.user_role)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.role != NEW.role OR OLD.email != NEW.email OR OLD.manager_id != NEW.manager_id) THEN
    INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id, timestamp)
    VALUES ('sys_profiles', TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), NOW());
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'sys_profiles' THEN
    IF OLD.role != NEW.role OR OLD.email != NEW.email THEN
      INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id, timestamp)
      VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), NEW.id, NOW());
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_cached_user_role()
 RETURNS user_role
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  cached_role user_role;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('user_role_' || auth.uid()::text));
  SELECT role INTO cached_role 
  FROM sys_profiles 
  WHERE id = auth.uid();
  RETURN COALESCE(cached_role, 'chuyên viên'::user_role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.search_banners(search_term text DEFAULT ''::text, category_filter uuid DEFAULT NULL::uuid, type_filter uuid DEFAULT NULL::uuid, status_filter text DEFAULT 'approved'::text, sort_by text DEFAULT 'created_desc'::text, page_num integer DEFAULT 1, page_size integer DEFAULT 18)
 RETURNS TABLE(id uuid, name text, image_url text, canva_link text, created_at timestamp with time zone, updated_at timestamp with time zone, category_id uuid, category_name text, banner_type_id uuid, banner_type_name text, status text, user_name text, total_count bigint)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
  current_user_role user_role;
BEGIN
  SELECT get_user_role(auth.uid()) INTO current_user_role;
  RETURN QUERY
  SELECT 
    b.id, b.name, b.image_url, b.canva_link, b.created_at, b.updated_at, b.category_id, c.name as category_name, b.banner_type_id, bt.name as banner_type_name, b.status::text, COALESCE(p.full_name, p.email) as user_name, COUNT(*) OVER() as total_count
  FROM banners b
  LEFT JOIN categories c ON b.category_id = c.id
  LEFT JOIN banner_types bt ON b.banner_type_id = bt.id
  LEFT JOIN sys_profiles p ON b.user_id = p.id
  WHERE 
    (search_term = '' OR b.name ILIKE '%' || search_term || '%')
    AND (category_filter IS NULL OR b.category_id = category_filter)
    AND (type_filter IS NULL OR b.banner_type_id = type_filter)
    AND (status_filter = 'all' OR b.status::text = status_filter)
    AND (
      current_user_role = 'admin' 
      OR (current_user_role != 'admin' AND b.status = 'approved')
    )
  ORDER BY 
    CASE WHEN current_user_role = 'admin' AND b.status = 'pending' THEN 0 ELSE 1 END,
    CASE WHEN sort_by = 'created_desc' THEN b.created_at END DESC,
    CASE WHEN sort_by = 'created_asc' THEN b.created_at END ASC,
    CASE WHEN sort_by = 'name_desc' THEN b.name END DESC,
    CASE WHEN sort_by = 'name_asc' THEN b.name END ASC,
    CASE WHEN sort_by NOT IN ('created_desc', 'created_asc', 'name_desc', 'name_asc') THEN b.created_at END DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$function$;