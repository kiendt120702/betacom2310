-- Add boolean flags to control lesson components
ALTER TABLE public.edu_knowledge_exercises
ADD COLUMN IF NOT EXISTS has_video BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_theory_test BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_practice_test BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS has_review_video BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN public.edu_knowledge_exercises.has_video IS 'Indicates if the lesson includes a video component.';
COMMENT ON COLUMN public.edu_knowledge_exercises.has_theory_test IS 'Indicates if the lesson includes a theory test (quiz/essay).';
COMMENT ON COLUMN public.edu_knowledge_exercises.has_practice_test IS 'Indicates if the lesson includes a practice test.';
COMMENT ON COLUMN public.edu_knowledge_exercises.has_review_video IS 'Indicates if the lesson requires review video submission.';