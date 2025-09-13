-- Remove watch_percentage column from user_exercise_progress table
-- This column is no longer needed as we're using video_view_count instead

-- Drop the watch_percentage column (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_exercise_progress') THEN
        ALTER TABLE user_exercise_progress DROP COLUMN IF EXISTS watch_percentage;
    END IF;
END $$;

-- Note: This migration removes the watch_percentage column which was previously used
-- to track video completion percentage. The system now uses video_view_count
-- and other metrics for tracking video progress.