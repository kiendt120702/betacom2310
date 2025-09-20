CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
WITH shop_assignments AS (
  -- Find the latest assignment for each shop name
  SELECT DISTINCT ON (name)
    name,
    profile_id
  FROM public.tiktok_shops
  WHERE profile_id IS NOT NULL
  ORDER BY name, created_at DESC
)
SELECT json_agg(shops_with_profile)
FROM (
    SELECT
        s.*,
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
                    FROM public.profiles m
                    WHERE m.id = p.manager_id
                )
            )
            FROM public.profiles p
            -- Use the profile_id from the shop_assignments CTE for all rows of the same name
            WHERE p.id = sa.profile_id
        ) as profile
    FROM public.tiktok_shops s
    LEFT JOIN shop_assignments sa ON s.name = sa.name
) as shops_with_profile;
$function$