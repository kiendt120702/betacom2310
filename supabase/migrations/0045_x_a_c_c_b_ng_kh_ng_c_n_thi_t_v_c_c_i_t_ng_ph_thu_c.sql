-- Step 1: Drop triggers that depend on functions or tables to be dropped
DROP TRIGGER IF EXISTS video_tracking_updated_at ON public.video_tracking;

-- Step 2: Drop functions that depend on the tables
DROP FUNCTION IF EXISTS public.get_video_dropout_points(uuid);
DROP FUNCTION IF EXISTS public.get_total_sessions();
DROP FUNCTION IF EXISTS public.get_avg_watch_time();
DROP FUNCTION IF EXISTS public.get_exercise_video_stats();
DROP FUNCTION IF EXISTS public.get_user_video_stats();
DROP FUNCTION IF EXISTS public.update_video_tracking_updated_at();

-- Step 3: Drop tables with foreign keys first
DROP TABLE IF EXISTS public.thumbnail_likes;
DROP TABLE IF EXISTS public.shop_revenue;

-- Step 4: Drop the main tables
DROP TABLE IF EXISTS public.tags;
DROP TABLE IF EXISTS public.video_tracking;
DROP TABLE IF EXISTS public.shops;

-- Step 5: Drop the foreign key constraint before dropping the shopee_shop_revenue table
ALTER TABLE public.shopee_shop_revenue DROP CONSTRAINT IF EXISTS shop_revenue_shop_id_fkey;
DROP TABLE IF EXISTS public.shopee_shop_revenue;