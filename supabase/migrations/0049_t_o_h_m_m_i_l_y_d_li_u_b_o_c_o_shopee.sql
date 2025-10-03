CREATE OR REPLACE FUNCTION public.get_shopee_reports_for_month(p_month_text text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    current_user_id UUID := auth.uid();
    current_user_role public.user_role;
    is_hr_viewer BOOLEAN;
BEGIN
    -- Determine the role of the current user
    SELECT role INTO current_user_role FROM public.sys_profiles WHERE id = current_user_id;

    -- Check if the user is a special HR viewer
    SELECT EXISTS (
        SELECT 1
        FROM public.sys_profiles p
        JOIN public.sys_departments d ON p.department_id = d.id
        WHERE p.id = current_user_id AND p.role = 'chuyên viên' AND d.name = 'Phòng Nhân Sự'
    ) INTO is_hr_viewer;

    -- Build and return the JSON result
    RETURN (
        SELECT jsonb_agg(jsonb_build_object(
            'id', cr.id,
            'report_date', cr.report_date,
            'total_revenue', cr.total_revenue,
            'total_orders', cr.total_orders,
            'average_order_value', cr.average_order_value,
            'product_clicks', cr.product_clicks,
            'total_visits', cr.total_visits,
            'conversion_rate', cr.conversion_rate,
            'cancelled_orders', cr.cancelled_orders,
            'cancelled_revenue', cr.cancelled_revenue,
            'returned_orders', cr.returned_orders,
            'returned_revenue', cr.returned_revenue,
            'total_buyers', cr.total_buyers,
            'new_buyers', cr.new_buyers,
            'existing_buyers', cr.existing_buyers,
            'potential_buyers', cr.potential_buyers,
            'buyer_return_rate', cr.buyer_return_rate,
            'created_at', cr.created_at,
            'updated_at', cr.updated_at,
            'shop_id', cr.shop_id,
            'feasible_goal', cr.feasible_goal,
            'breakthrough_goal', cr.breakthrough_goal,
            'shops', jsonb_build_object(
                'name', s.name,
                'profile', p_info.profile_json
            )
        ))
        FROM public.shopee_comprehensive_reports cr
        JOIN public.shopee_shops s ON cr.shop_id = s.id
        LEFT JOIN (
            SELECT
                p.id,
                jsonb_build_object(
                    'full_name', p.full_name,
                    'email', p.email,
                    'manager_id', p.manager_id,
                    'manager', m_info.manager_json
                ) as profile_json
            FROM public.sys_profiles p
            LEFT JOIN (
                SELECT id, jsonb_build_object('id', id, 'full_name', full_name, 'email', email) as manager_json
                FROM public.sys_profiles
            ) m_info ON p.manager_id = m_info.id
        ) p_info ON s.profile_id = p_info.id
        WHERE
            cr.report_date >= date_trunc('month', p_month_text::date) AND
            cr.report_date < (date_trunc('month', p_month_text::date) + interval '1 month') AND
            (
                current_user_role = 'admin' OR
                is_hr_viewer OR
                s.profile_id = current_user_id OR
                (current_user_role = 'leader' AND s.profile_id IN (SELECT id FROM public.sys_profiles WHERE manager_id = current_user_id))
            )
    );
END;
$function$