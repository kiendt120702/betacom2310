-- Create functions for dashboard data retrieval

-- Function to get all shops for dashboard
CREATE OR REPLACE FUNCTION get_all_shops_for_dashboard()
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    description TEXT,
    profile_id UUID,
    leader_id UUID,
    team_id UUID,
    status TEXT,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    profile JSONB
)
AS $$
BEGIN
    -- Check if user has permission (admin or leader)
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'leader')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin or leader role required.';
    END IF;

    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.description,
        s.profile_id,
        s.leader_id,
        s.team_id,
        s.status::TEXT,
        s.created_at,
        s.updated_at,
        CASE 
            WHEN s.profile_id IS NOT NULL THEN
                json_build_object(
                    'id', p.id,
                    'full_name', p.full_name,
                    'email', p.email,
                    'role', p.role,
                    'manager', CASE 
                        WHEN m.id IS NOT NULL THEN
                            json_build_object(
                                'id', m.id,
                                'full_name', m.full_name,
                                'email', m.email
                            )
                        ELSE NULL
                    END
                )::JSONB
            ELSE NULL
        END as profile
    FROM shopee_shops s
    LEFT JOIN profiles p ON s.profile_id = p.id
    LEFT JOIN profiles m ON p.manager_id = m.id
    ORDER BY s.name;
END
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all reports for dashboard by month
CREATE OR REPLACE FUNCTION get_all_reports_for_dashboard(month_text TEXT)
RETURNS TABLE (
    id UUID,
    report_date DATE,
    total_revenue DECIMAL(15,2),
    total_orders INTEGER,
    average_order_value DECIMAL(15,2),
    product_clicks INTEGER,
    total_visits INTEGER,
    conversion_rate DECIMAL(5,4),
    cancelled_orders INTEGER,
    cancelled_revenue DECIMAL(15,2),
    returned_orders INTEGER,
    returned_revenue DECIMAL(15,2),
    total_buyers INTEGER,
    new_buyers INTEGER,
    existing_buyers INTEGER,
    potential_buyers INTEGER,
    buyer_return_rate DECIMAL(5,4),
    shop_id UUID,
    feasible_goal DECIMAL(15,2),
    breakthrough_goal DECIMAL(15,2),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user has permission (admin or leader)
    IF NOT EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'leader')
    ) THEN
        RAISE EXCEPTION 'Access denied. Admin or leader role required.';
    END IF;

    RETURN QUERY
    SELECT 
        cr.id,
        cr.report_date,
        cr.total_revenue,
        cr.total_orders,
        cr.average_order_value,
        cr.product_clicks,
        cr.total_visits,
        cr.conversion_rate,
        cr.cancelled_orders,
        cr.cancelled_revenue,
        cr.returned_orders,
        cr.returned_revenue,
        cr.total_buyers,
        cr.new_buyers,
        cr.existing_buyers,
        cr.potential_buyers,
        cr.buyer_return_rate,
        cr.shop_id,
        cr.feasible_goal,
        cr.breakthrough_goal,
        cr.created_at,
        cr.updated_at
    FROM comprehensive_reports cr
    WHERE DATE_TRUNC('month', cr.report_date) = (month_text || '-01')::DATE
    ORDER BY cr.report_date DESC, cr.shop_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_all_shops_for_dashboard() TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_reports_for_dashboard(TEXT) TO authenticated;