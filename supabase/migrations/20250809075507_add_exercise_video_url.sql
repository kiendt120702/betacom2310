-- Add video URL field to edu_knowledge_exercises table (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'edu_knowledge_exercises' AND column_name = 'exercise_video_url'
  ) THEN
    ALTER TABLE edu_knowledge_exercises 
    ADD COLUMN exercise_video_url TEXT;
  END IF;
END $$;