# TikTok Comprehensive Report Display Fix

## Problem Description
The TikTok comprehensive report table is not displaying the following columns despite having data in the database:
- ✅ Mục tiêu khả thi (Feasible Goal) 
- ✅ Mục tiêu đột phá (Breakthrough Goal)
- ❌ Tổng giá trị hàng hóa (Total Product Value)
- ❌ Hoàn tiền (Refunds) 
- ❌ Phân tích tổng doanh thu có trợ cấp của nền tảng cho sản phẩm (Platform Subsidized Revenue)
- ❌ Số món bán ra (Items Sold)
- ❌ Khách hàng (Customers)
- ❌ Lượt xem trang (Page Views)
- ❌ Lượt truy cập trang Cửa hàng (Store Visits)
- ❌ Đơn hàng SKU (SKU Orders)
- ❌ Đơn hàng (Orders)
- ❌ Tỷ lệ chuyển đổi tính theo tháng (Monthly Conversion Rate)

## Root Cause Analysis

### 1. Missing Database Columns
The `tiktok_comprehensive_reports` table is missing several columns that the frontend expects:
- `platform_subsidized_revenue` - Doanh thu có trợ cấp từ nền tảng
- `items_sold` - Số món bán ra
- `total_buyers` - Tổng số khách hàng
- `total_visits` - Lượt xem trang
- `store_visits` - Lượt truy cập trang cửa hàng
- `sku_orders` - Đơn hàng SKU

### 2. Missing Type Export
The TypeScript types were missing the `TiktokComprehensiveReport` export in `src/integrations/supabase/types/tables.ts`.

## Solution Applied

### ✅ Step 1: Fixed TypeScript Types
Added the missing export in `src/integrations/supabase/types/tables.ts`:
```typescript
export type TiktokComprehensiveReport = Tables<'tiktok_comprehensive_reports'>;
```

### ⏳ Step 2: Database Migration Required
You need to apply the database migration to add the missing columns.

## Manual Migration Steps

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://agshelsxkotwfvkzlwtn.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250116000000_add_tiktok_specific_columns.sql`
4. Click **Run** to execute the migration

### Option 2: Using Supabase CLI (if linked)
```bash
supabase link --project-ref agshelsxkotwfvkzlwtn
supabase db push
```

## Migration SQL Preview

The migration will add these columns:

```sql
ALTER TABLE tiktok_comprehensive_reports 
ADD COLUMN IF NOT EXISTS platform_subsidized_revenue DECIMAL(15,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS items_sold INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_buyers INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS store_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS sku_orders INTEGER DEFAULT 0;
```

## Expected Results After Migration

Once the migration is applied, the TikTok comprehensive report table will display:

1. **Mục tiêu khả thi** - Shows feasible goals from database
2. **Mục tiêu đột phá** - Shows breakthrough goals from database  
3. **Tổng giá trị hàng hóa** - Shows total_revenue values
4. **Hoàn tiền** - Shows returned_revenue values
5. **Phân tích tổng doanh thu có trợ cấp** - Shows platform_subsidized_revenue values
6. **Số món bán ra** - Shows items_sold values
7. **Khách hàng** - Shows total_buyers values
8. **Lượt xem trang** - Shows total_visits values
9. **Lượt truy cập trang Cửa hàng** - Shows store_visits values
10. **Đơn hàng SKU** - Shows sku_orders values
11. **Đơn hàng** - Shows total_orders values
12. **Tỷ lệ chuyển đổi** - Shows calculated conversion_rate values

## Files Modified

- ✅ `src/integrations/supabase/types/tables.ts` - Added TiktokComprehensiveReport export
- ⏳ Database schema - Requires manual migration

## Verification Steps

1. Apply the database migration
2. Refresh the TikTok reports page
3. Verify all columns are displaying data
4. Check that goals, revenue, and metrics are visible

## Technical Details

### Frontend Components Affected
- `src/components/tiktok-shops/TiktokComprehensiveReportTable.tsx`
- `src/hooks/useTiktokComprehensiveReportData.ts`
- `src/hooks/useTiktokComprehensiveReports.ts`

### Database Tables
- `tiktok_comprehensive_reports` - Main data table
- `tiktok_shops` - Shop information

The frontend code is already prepared to handle these columns, they just need to exist in the database schema.