
-- Add column to store required review videos count for each exercise (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'edu_knowledge_exercises' AND column_name = 'required_review_videos'
  ) THEN
    ALTER TABLE edu_knowledge_exercises 
    ADD COLUMN required_review_videos integer NOT NULL DEFAULT 3;
    
    -- Update sample data for existing exercises
    UPDATE edu_knowledge_exercises 
    SET required_review_videos = 5 
    WHERE required_review_videos = 3;
  END IF;
END $$;

-- Index creation removed - exercise_review_submissions table does not exist
-- CREATE INDEX IF NOT EXISTS idx_exercise_review_submissions_exercise_user 
-- ON exercise_review_submissions(exercise_id, user_id);
