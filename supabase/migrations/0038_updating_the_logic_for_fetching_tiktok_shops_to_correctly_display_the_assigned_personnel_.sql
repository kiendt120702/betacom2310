CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
WITH latest_shop_versions AS (
  -- Get the most recent record for each unique shop name. This represents the shop's current state.
  SELECT DISTINCT ON (name) *
  FROM public.tiktok_shops
  ORDER BY name, created_at DESC
)
SELECT json_agg(shops_with_details)
FROM (
  SELECT
    lsv.*,
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
      WHERE p.id = lsv.profile_id -- Use the profile_id from the latest version directly
    ) as profile
  FROM latest_shop_versions lsv
) as shops_with_details;
$function$