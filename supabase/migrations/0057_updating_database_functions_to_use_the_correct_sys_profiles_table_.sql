-- Fix is_special_viewer function
CREATE OR REPLACE FUNCTION public.is_special_viewer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.sys_profiles
    WHERE id = auth.uid() AND full_name = 'Trương Thị Quỳnh'
  );
$function$;

-- Fix get_all_shops_for_dashboard function
CREATE OR REPLACE FUNCTION public.get_all_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT json_agg(shops_with_profile)
    FROM (
        SELECT
            s.*,
            (
                SELECT jsonb_build_object(
                    'id', p.id,
                    'full_name', p.full_name,
                    'email', p.email,
                    'team_id', p.department_id,
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
                WHERE p.id = s.profile_id
            ) as profile
        FROM public.shopee_shops s
    ) as shops_with_profile;
$function$;

-- Fix get_public_generations function
CREATE OR REPLACE FUNCTION public.get_public_generations(page_size integer DEFAULT 50, page_num integer DEFAULT 1)
 RETURNS TABLE(id uuid, prompt text, output_image_url text, input_image_urls text[], created_at timestamp with time zone, user_id uuid, user_full_name text, user_email text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  offset_val integer := (page_num - 1) * page_size;
BEGIN
  RETURN QUERY
  SELECT
    ig.id,
    ig.prompt,
    ig.output_image_url,
    ig.input_image_urls,
    ig.created_at,
    ig.user_id,
    p.full_name,
    p.email
  FROM
    public.imgai_generations AS ig
  LEFT JOIN
    public.sys_profiles AS p ON ig.user_id = p.id
  WHERE
    ig.visibility = 'public'
  ORDER BY
    ig.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$function$;

-- Fix manage_user_profile trigger function
CREATE OR REPLACE FUNCTION public.manage_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.sys_profiles (id, email, full_name, role, created_at, updated_at)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 'chuyên viên', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      updated_at = NOW();
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;