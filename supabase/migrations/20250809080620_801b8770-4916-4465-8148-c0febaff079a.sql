
-- Add exercise_video_url column to edu_knowledge_exercises table (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'edu_knowledge_exercises' AND column_name = 'exercise_video_url'
  ) THEN
    ALTER TABLE public.edu_knowledge_exercises 
    ADD COLUMN exercise_video_url TEXT;
    
    -- Add comment for the new column
    COMMENT ON COLUMN public.edu_knowledge_exercises.exercise_video_url IS 'URL of the exercise video stored in Supabase storage';
  END IF;
END $$;
