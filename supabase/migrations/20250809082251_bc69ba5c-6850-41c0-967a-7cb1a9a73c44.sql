
-- Add 2 new columns to edu_knowledge_exercises table (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'edu_knowledge_exercises' AND column_name = 'min_study_sessions'
  ) THEN
    ALTER TABLE edu_knowledge_exercises 
    ADD COLUMN min_study_sessions INTEGER DEFAULT 1 NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'edu_knowledge_exercises' AND column_name = 'min_review_videos'
  ) THEN
    ALTER TABLE edu_knowledge_exercises 
    ADD COLUMN min_review_videos INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;
