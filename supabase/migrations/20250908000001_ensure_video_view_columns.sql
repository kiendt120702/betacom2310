-- Ensure video_view_count column exists in user_exercise_progress
ALTER TABLE user_exercise_progress 
ADD COLUMN IF NOT EXISTS video_view_count INTEGER NOT NULL DEFAULT 0;

-- Ensure required_viewing_count column exists in edu_knowledge_exercises  
ALTER TABLE edu_knowledge_exercises
ADD COLUMN IF NOT EXISTS required_viewing_count INTEGER NOT NULL DEFAULT 1;

-- Add indexes for better performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_video_view_count 
ON user_exercise_progress(video_view_count);

-- Create or replace the increment function (in case it wasn't created properly)
CREATE OR REPLACE FUNCTION increment_video_view_count(
    p_user_id UUID,
    p_exercise_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    current_count INTEGER := 0;
BEGIN
    -- Insert or update the user exercise progress record
    INSERT INTO user_exercise_progress (
        user_id,
        exercise_id,
        video_view_count,
        created_at,
        updated_at
    )
    VALUES (
        p_user_id,
        p_exercise_id,
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id, exercise_id)
    DO UPDATE SET 
        video_view_count = user_exercise_progress.video_view_count + 1,
        updated_at = NOW()
    RETURNING video_view_count INTO current_count;

    RETURN current_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_video_view_count(UUID, UUID) TO authenticated;

-- Update existing records to have default values if they are null
UPDATE user_exercise_progress 
SET video_view_count = 0 
WHERE video_view_count IS NULL;

UPDATE edu_knowledge_exercises 
SET required_viewing_count = 1 
WHERE required_viewing_count IS NULL;