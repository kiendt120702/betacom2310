-- Sample TikTok data để test comprehensive reports
-- Chạy trong Supabase SQL Editor

INSERT INTO tiktok_comprehensive_reports (
    shop_id, 
    report_date, 
    total_revenue, 
    cancelled_revenue, 
    returned_revenue,
    platform_subsidized_revenue,
    items_sold,
    total_buyers,
    total_visits,
    store_visits,
    sku_orders,
    total_orders,
    conversion_rate
) VALUES 
-- Koban Fashion Store sample data
(
    '52c72228-0dd7-4488-89db-c12b59f545aa',
    '2025-09-02', 
    1500000, 
    0, 
    50000,
    200000,
    100,
    50,
    1000,
    800,
    75,
    60,
    6.0
),
(
    '52c72228-0dd7-4488-89db-c12b59f545aa',
    '2025-09-03', 
    2000000, 
    0, 
    75000,
    300000,
    150,
    75,
    1500,
    1200,
    100,
    85,
    5.7
),
-- Trionex sample data  
(
    '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f',
    '2025-09-02',
    800000,
    0,
    30000,
    120000,
    60,
    30,
    600,
    450,
    40,
    35,
    5.8
),
(
    '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f',
    '2025-09-03',
    1200000,
    0,
    45000,
    180000,
    90,
    45,
    900,
    700,
    65,
    55,
    6.1
)
ON CONFLICT (shop_id, report_date) 
DO UPDATE SET 
    total_revenue = EXCLUDED.total_revenue,
    returned_revenue = EXCLUDED.returned_revenue,
    platform_subsidized_revenue = EXCLUDED.platform_subsidized_revenue,
    items_sold = EXCLUDED.items_sold,
    total_buyers = EXCLUDED.total_buyers,
    total_visits = EXCLUDED.total_visits,
    store_visits = EXCLUDED.store_visits,
    sku_orders = EXCLUDED.sku_orders,
    total_orders = EXCLUDED.total_orders,
    conversion_rate = EXCLUDED.conversion_rate;