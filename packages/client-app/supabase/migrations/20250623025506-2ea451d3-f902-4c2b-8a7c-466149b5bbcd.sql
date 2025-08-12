
-- Xóa các bảng SEO không sử dụng
DROP TABLE IF EXISTS public.seo_chat_messages CASCADE;
DROP TABLE IF EXISTS public.seo_chat_conversations CASCADE;
DROP TABLE IF EXISTS public.seo_knowledge CASCADE;

-- Xóa function tìm kiếm SEO không sử dụng
DROP FUNCTION IF EXISTS public.search_seo_knowledge(vector, double precision, integer);
