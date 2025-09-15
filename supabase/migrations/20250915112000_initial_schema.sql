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

-- Create Tables
CREATE TABLE public.teams (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT teams_pkey PRIMARY KEY (id),
    CONSTRAINT teams_name_key UNIQUE (name)
);

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    role public.user_role DEFAULT 'chuyên viên'::public.user_role,
    team_id uuid,
    phone text,
    work_type public.work_type DEFAULT 'fulltime'::public.work_type,
    join_date date,
    manager_id uuid,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_email_key UNIQUE (email),
    CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
    CONSTRAINT profiles_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE SET NULL
);

CREATE TABLE public.shopee_shops (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    status public.shopee_shop_status DEFAULT 'Đang Vận Hành'::public.shopee_shop_status,
    profile_id uuid,
    CONSTRAINT shopee_shops_pkey PRIMARY KEY (id),
    CONSTRAINT shopee_shops_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.tiktok_shops (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    profile_id uuid,
    status public.tiktok_shop_status DEFAULT 'Đang Vận Hành'::public.tiktok_shop_status,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    type public.tiktok_shop_type NOT NULL DEFAULT 'Vận hành'::public.tiktok_shop_type,
    CONSTRAINT tiktok_shops_pkey PRIMARY KEY (id),
    CONSTRAINT tiktok_shops_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE TABLE public.shopee_comprehensive_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    report_date date NOT NULL,
    total_revenue numeric,
    total_orders integer,
    average_order_value numeric,
    product_clicks integer,
    total_visits integer,
    conversion_rate numeric,
    cancelled_orders integer,
    cancelled_revenue numeric,
    returned_orders integer,
    returned_revenue numeric,
    total_buyers integer,
    new_buyers integer,
    existing_buyers integer,
    potential_buyers integer,
    buyer_return_rate numeric,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    shop_id uuid,
    feasible_goal numeric,
    breakthrough_goal numeric,
    CONSTRAINT shopee_comprehensive_reports_pkey PRIMARY KEY (id),
    CONSTRAINT shopee_comprehensive_reports_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.shopee_shops(id) ON DELETE CASCADE,
    CONSTRAINT shopee_comprehensive_reports_report_date_shop_id_key UNIQUE (report_date, shop_id)
);

CREATE TABLE public.tiktok_comprehensive_reports (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    shop_id uuid,
    report_date date NOT NULL,
    total_revenue numeric,
    total_orders integer,
    total_visits integer,
    conversion_rate numeric,
    returned_revenue numeric,
    total_buyers integer,
    feasible_goal numeric,
    breakthrough_goal numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    platform_subsidized_revenue numeric,
    items_sold integer,
    store_visits integer,
    sku_orders integer,
    cancelled_revenue numeric,
    cancelled_orders integer,
    CONSTRAINT tiktok_comprehensive_reports_pkey PRIMARY KEY (id),
    CONSTRAINT tiktok_comprehensive_reports_shop_id_fkey FOREIGN KEY (shop_id) REFERENCES public.tiktok_shops(id) ON DELETE CASCADE,
    CONSTRAINT tiktok_comprehensive_reports_report_date_shop_id_key UNIQUE (report_date, shop_id)
);

CREATE TABLE public.edu_knowledge_exercises (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    is_required boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    exercise_video_url text,
    min_study_sessions integer NOT NULL DEFAULT 1,
    min_review_videos integer NOT NULL DEFAULT 0,
    required_review_videos integer NOT NULL DEFAULT 3,
    target_roles public.user_role[],
    target_team_ids uuid[],
    documents jsonb,
    required_viewing_count integer NOT NULL DEFAULT 1,
    min_completion_time integer,
    CONSTRAINT edu_knowledge_exercises_pkey PRIMARY KEY (id),
    CONSTRAINT edu_knowledge_exercises_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.edu_quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    exercise_id uuid NOT NULL,
    title text NOT NULL,
    passing_score smallint NOT NULL DEFAULT 80,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quizzes_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.edu_knowledge_exercises(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    content text NOT NULL,
    question_type public.question_type NOT NULL DEFAULT 'single_choice'::public.question_type,
    order_index smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quiz_questions_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.edu_quizzes(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_answers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL,
    content text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    order_index smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quiz_answers_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.edu_quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    user_id uuid NOT NULL,
    score smallint NOT NULL,
    passed boolean NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    answers jsonb,
    CONSTRAINT edu_quiz_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_submissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.edu_quizzes(id) ON DELETE CASCADE,
    CONSTRAINT edu_quiz_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_exercise_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    is_completed boolean NOT NULL DEFAULT false,
    completed_at timestamp with time zone,
    time_spent integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    video_completed boolean NOT NULL DEFAULT false,
    recap_submitted boolean NOT NULL DEFAULT false,
    quiz_passed boolean NOT NULL DEFAULT false,
    video_duration integer,
    session_count integer NOT NULL DEFAULT 1,
    theory_read boolean NOT NULL DEFAULT false,
    watch_percentage integer DEFAULT 0,
    video_view_count integer NOT NULL DEFAULT 0,
    CONSTRAINT user_exercise_progress_pkey PRIMARY KEY (id),
    CONSTRAINT user_exercise_progress_user_id_exercise_id_key UNIQUE (user_id, exercise_id),
    CONSTRAINT user_exercise_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_exercise_progress_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.edu_knowledge_exercises(id) ON DELETE CASCADE
);

CREATE TABLE public.thumbnail_categories (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_categories_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_categories_name_key UNIQUE (name)
);

CREATE TABLE public.thumbnail_types (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_types_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_types_name_key UNIQUE (name)
);

CREATE TABLE public.thumbnail_banners (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    image_url text NOT NULL,
    thumbnail_category_id uuid,
    thumbnail_type_id uuid,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    canva_link text,
    status public.banner_status DEFAULT 'pending'::public.banner_status,
    approved_by uuid,
    approved_at timestamp with time zone,
    CONSTRAINT thumbnail_banners_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_banners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT thumbnail_banners_thumbnail_category_id_fkey FOREIGN KEY (thumbnail_category_id) REFERENCES public.thumbnail_categories(id) ON DELETE SET NULL,
    CONSTRAINT thumbnail_banners_thumbnail_type_id_fkey FOREIGN KEY (thumbnail_type_id) REFERENCES public.thumbnail_types(id) ON DELETE SET NULL,
    CONSTRAINT thumbnail_banners_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.thumbnail_likes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    thumbnail_banner_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT thumbnail_likes_pkey PRIMARY KEY (id),
    CONSTRAINT thumbnail_likes_user_id_thumbnail_banner_id_key UNIQUE (user_id, thumbnail_banner_id),
    CONSTRAINT thumbnail_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT thumbnail_likes_thumbnail_banner_id_fkey FOREIGN KEY (thumbnail_banner_id) REFERENCES public.thumbnail_banners(id) ON DELETE CASCADE
);

-- Add other tables...
-- ... (This will be a very long list of CREATE TABLE statements)

-- Create Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- ... (Add all other functions from your context)

-- Enable RLS and create policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::public.user_role);
-- ... (Add all other policies for all tables)

-- Create Triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ... (Add all other triggers)