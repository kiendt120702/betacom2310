# Fix for TikTok Report Display Issue

## Problem
The TikTok comprehensive report table is not displaying the following columns despite having data in the database:
- Mục tiêu khả thi (Feasible Goal)
- Mục tiêu đột phá (Breakthrough Goal) 
- Tổng giá trị hàng hóa (Total Product Value)
- Hoàn tiền (Refunds)
- Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm (Platform Subsidized Revenue)
- Số món bán ra (Items Sold)
- Khách hàng (Customers)
- Lượt xem trang (Page Views)
- Lượt truy cập trang Cửa hàng (Store Visits)
- Đơn hàng SKU (SKU Orders)
- Đơn hàng (Orders)
- Tỷ lệ chuyển đổi tính theo tháng (Monthly Conversion Rate)

## Root Cause
The database table `tiktok_comprehensive_reports` is missing several columns that the frontend code expects:
- `platform_subsidized_revenue`
- `items_sold`
- `total_buyers`
- `total_visits`
- `store_visits`
- `sku_orders`

## Solution
Apply the migration file: `supabase/migrations/20250116000000_add_tiktok_specific_columns.sql`

### Method 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard: https://agshelsxkotwfvkzlwtn.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the contents of the migration file
4. Click **Run** to execute the migration

### Method 2: Using Supabase CLI (if project is linked)
```bash
# Link the project first (if not already linked)
supabase link --project-ref agshelsxkotwfvkzlwtn

# Then push the migration
supabase db push
```

### Method 3: Direct SQL Execution
Run the following SQL directly in your Supabase SQL Editor:

```sql
-- Add missing TikTok-specific columns to tiktok_comprehensive_reports table
ALTER TABLE tiktok_comprehensive_reports 
ADD COLUMN IF NOT EXISTS platform_subsidized_revenue DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_buyers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku_orders INTEGER DEFAULT 0;
```

## Verification
After applying the migration:
1. Refresh the TikTok report page
2. Check that all columns are now displaying data
3. Verify that the sample data shows up correctly for existing shops

## Files Modified
- Created: `supabase/migrations/20250116000000_add_tiktok_specific_columns.sql`
- This file: `apply-tiktok-migration.md`