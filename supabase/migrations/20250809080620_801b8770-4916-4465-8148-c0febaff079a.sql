
-- Add exercise_video_url column to edu_knowledge_exercises table
ALTER TABLE public.edu_knowledge_exercises 
ADD COLUMN exercise_video_url TEXT;

-- Add comment for the new column
COMMENT ON COLUMN public.edu_knowledge_exercises.exercise_video_url IS 'URL of the exercise video stored in Supabase storage';
