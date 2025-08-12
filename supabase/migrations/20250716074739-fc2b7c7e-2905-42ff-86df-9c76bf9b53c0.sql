
-- Xóa các bảng product_session_items và product_sessions nếu không sử dụng
DROP TABLE IF EXISTS public.product_session_items CASCADE;
DROP TABLE IF EXISTS public.product_sessions CASCADE;

-- Xóa các function không sử dụng nếu có
DROP FUNCTION IF EXISTS public.get_daily_chat_usage(timestamp with time zone, timestamp with time zone);
DROP FUNCTION IF EXISTS public.get_top_users_by_messages(timestamp with time zone, timestamp with time zone, integer);
DROP FUNCTION IF EXISTS public.get_top_bots_by_messages(timestamp with time zone, timestamp with time zone, integer);
DROP FUNCTION IF EXISTS public.get_chat_statistics(timestamp with time zone, timestamp with time zone);

-- Xóa view banner_statistics nếu không sử dụng
DROP MATERIALIZED VIEW IF EXISTS public.banner_statistics CASCADE;
DROP FUNCTION IF EXISTS public.refresh_banner_statistics();
DROP FUNCTION IF EXISTS public.trigger_refresh_banner_statistics();
