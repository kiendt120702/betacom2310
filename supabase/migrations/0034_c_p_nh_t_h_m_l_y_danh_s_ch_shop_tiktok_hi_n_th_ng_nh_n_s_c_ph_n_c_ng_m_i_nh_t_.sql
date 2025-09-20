CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
WITH latest_shops AS (
  -- Lấy bản ghi mới nhất cho mỗi shop dựa trên tên
  SELECT DISTINCT ON (name) *
  FROM public.tiktok_shops
  ORDER BY name, created_at DESC
)
SELECT json_agg(shops_with_profile)
FROM (
    SELECT
        s.id,
        s.name,
        s.status,
        s.type,
        s.created_at,
        s.updated_at,
        s.profile_id,
        p.profile_details as profile
    FROM latest_shops s
    LEFT JOIN (
        -- Tạo sẵn JSON cho thông tin nhân sự để join hiệu quả hơn
        SELECT
            p.id,
            jsonb_build_object(
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
                    FROM public.profiles m
                    WHERE m.id = p.manager_id
                )
            ) as profile_details
        FROM public.profiles p
    ) p ON s.profile_id = p.id
) as shops_with_profile;
$function$