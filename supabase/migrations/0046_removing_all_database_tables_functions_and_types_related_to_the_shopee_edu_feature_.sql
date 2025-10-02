-- Start transaction
BEGIN;

-- Drop related functions first
DROP FUNCTION IF EXISTS public.start_essay_test(uuid, integer);
DROP FUNCTION IF EXISTS public.calculate_engagement_score(uuid);

-- Drop all tables related to the education/training feature
-- Using CASCADE to handle dependencies automatically
DROP TABLE IF EXISTS public.edu_knowledge_exercises CASCADE;
DROP TABLE IF EXISTS public.edu_quizzes CASCADE;
DROP TABLE IF EXISTS public.edu_quiz_questions CASCADE;
DROP TABLE IF EXISTS public.edu_quiz_answers CASCADE;
DROP TABLE IF EXISTS public.edu_quiz_submissions CASCADE;
DROP TABLE IF EXISTS public.edu_essay_questions CASCADE;
DROP TABLE IF EXISTS public.edu_essay_submissions CASCADE;
DROP TABLE IF EXISTS public.user_exercise_progress CASCADE;
DROP TABLE IF EXISTS public.user_exercise_recaps CASCADE;
DROP TABLE IF EXISTS public.exercise_review_submissions CASCADE;

-- Drop the related enum type
DROP TYPE IF EXISTS public.question_type;

-- Commit transaction
COMMIT;