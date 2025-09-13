-- Remove unused columns from user_exercise_progress table

-- Drop theory_read column and its index from user_exercise_progress (only if table exists)
DROP INDEX IF EXISTS idx_user_exercise_progress_theory_read;
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_exercise_progress') THEN
        ALTER TABLE user_exercise_progress DROP COLUMN IF EXISTS theory_read;
        ALTER TABLE user_exercise_progress DROP COLUMN IF EXISTS notes;
    END IF;
END $$;

-- Note: video_tracking table does not exist in current schema
-- watch_percentage column removal is not needed

-- Update any functions that might reference these columns
-- Note: This will require updating the video analytics functions