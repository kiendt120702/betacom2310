-- Step 1: Drop tables that have foreign keys pointing to other tables in the list
DROP TABLE IF EXISTS public.general_training_recaps;
DROP TABLE IF EXISTS public.general_training_exercise_tags;
DROP TABLE IF EXISTS public.practice_test_submissions;
DROP TABLE IF EXISTS public.user_active_sessions;

-- Step 2: Now drop the tables that were referenced
DROP TABLE IF EXISTS public.general_training_exercises;
DROP TABLE IF EXISTS public.practice_tests;
DROP TABLE IF EXISTS public.user_login_sessions;

-- Step 3: Drop the remaining tables that have no dependencies within this list
DROP TABLE IF EXISTS public.tiktok_shop_revenue;
DROP TABLE IF EXISTS public.user_course_progress;
DROP TABLE IF EXISTS public.user_video_progress;
DROP TABLE IF EXISTS public.audit_log;
DROP TABLE IF EXISTS public.imgai_generations;