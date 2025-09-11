-- Add missing TikTok-specific columns to tiktok_comprehensive_reports table
-- These columns are required for the comprehensive report display

ALTER TABLE tiktok_comprehensive_reports 
ADD COLUMN IF NOT EXISTS platform_subsidized_revenue DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_buyers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku_orders INTEGER DEFAULT 0;

-- Add comments to document the new columns
COMMENT ON COLUMN tiktok_comprehensive_reports.platform_subsidized_revenue IS 'Doanh thu có trợ cấp từ nền tảng TikTok';
COMMENT ON COLUMN tiktok_comprehensive_reports.items_sold IS 'Số món bán ra';
COMMENT ON COLUMN tiktok_comprehensive_reports.total_buyers IS 'Tổng số khách hàng';
COMMENT ON COLUMN tiktok_comprehensive_reports.total_visits IS 'Lượt xem trang';
COMMENT ON COLUMN tiktok_comprehensive_reports.store_visits IS 'Lượt truy cập trang cửa hàng';
COMMENT ON COLUMN tiktok_comprehensive_reports.sku_orders IS 'Đơn hàng SKU';

-- Update existing sample data to include the new columns
UPDATE tiktok_comprehensive_reports 
SET 
    platform_subsidized_revenue = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 200000
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 300000
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 120000
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 180000
        ELSE 0
    END,
    items_sold = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 100
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 150
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 60
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 90
        ELSE 0
    END,
    total_buyers = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 50
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 75
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 30
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 45
        ELSE 0
    END,
    total_visits = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 1000
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 1500
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 600
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 900
        ELSE 0
    END,
    store_visits = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 800
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 1200
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 450
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 700
        ELSE 0
    END,
    sku_orders = CASE 
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-02' THEN 75
        WHEN shop_id = '52c72228-0dd7-4488-89db-c12b59f545aa' AND report_date = '2025-09-03' THEN 100
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-02' THEN 40
        WHEN shop_id = '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f' AND report_date = '2025-09-03' THEN 65
        ELSE 0
    END
WHERE shop_id IN ('52c72228-0dd7-4488-89db-c12b59f545aa', '173d90a1-2773-4b88-a0d0-a7c1d5a8d02f');

-- Create indexes for the new columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_platform_subsidized ON tiktok_comprehensive_reports(platform_subsidized_revenue);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_items_sold ON tiktok_comprehensive_reports(items_sold);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_total_buyers ON tiktok_comprehensive_reports(total_buyers);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_total_visits ON tiktok_comprehensive_reports(total_visits);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_store_visits ON tiktok_comprehensive_reports(store_visits);
CREATE INDEX IF NOT EXISTS idx_tiktok_reports_sku_orders ON tiktok_comprehensive_reports(sku_orders);