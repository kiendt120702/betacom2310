CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SET search_path TO 'public'
AS $function$
    SELECT json_agg(shops_with_profile)
    FROM (
        SELECT DISTINCT ON (s.name)
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
                WHERE p.id = s.profile_id
            ) as profile
        FROM public.tiktok_shops s
        ORDER BY s.name, s.profile_id DESC NULLS LAST
    ) as shops_with_profile;
$function$