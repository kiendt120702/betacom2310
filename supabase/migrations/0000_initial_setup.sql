-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;

-- Create ENUM types
CREATE TYPE public.banner_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.feedback_status AS ENUM ('pending', 'reviewed', 'resolved');
CREATE TYPE public.feedback_type AS ENUM ('bug', 'suggestion', 'general');
CREATE TYPE public.permission_type AS ENUM ('grant', 'deny');
CREATE TYPE public.question_type AS ENUM ('single_choice', 'multiple_choice');
CREATE TYPE public.shopee_shop_status AS ENUM ('Shop mới', 'Đang Vận Hành', 'Đã Dừng');
CREATE TYPE public.tiktok_shop_status AS ENUM ('Shop mới', 'Đang Vận Hành', 'Đã Dừng');
CREATE TYPE public.tiktok_shop_type AS ENUM ('Vận hành', 'Booking');
CREATE TYPE public.user_role AS ENUM ('admin', 'leader', 'chuyên viên', 'học việc/thử việc', 'trưởng phòng', 'deleted', 'booking');
CREATE TYPE public.work_type AS ENUM ('fulltime', 'parttime');