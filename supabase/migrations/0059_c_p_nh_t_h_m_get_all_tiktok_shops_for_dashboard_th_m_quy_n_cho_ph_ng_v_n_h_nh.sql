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
                WHERE p.id = ts.profile_id
            ) as profile
        FROM public.tiktok_shops ts
        WHERE
            (
                (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'trưởng phòng'::user_role])) OR 
                is_special_viewer() OR 
                is_hr_viewer() OR
                is_operations_viewer() OR
                (
                    (get_user_role(auth.uid()) = 'leader'::user_role) AND 
                    (EXISTS (SELECT 1 FROM sys_profiles p WHERE p.id = ts.profile_id AND p.manager_id = auth.uid()))
                ) OR 
                (ts.profile_id = auth.uid())
            )
    ) as shops_with_details;
$function$