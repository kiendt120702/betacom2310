-- Add video view count column to user_exercise_progress table
-- This will track how many times a user has watched the video for each exercise

-- First, add the column to store video view count
ALTER TABLE user_exercise_progress 
ADD COLUMN IF NOT EXISTS video_view_count INTEGER NOT NULL DEFAULT 0;

-- Add index for better performance when querying by video view count
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_video_view_count 
ON user_exercise_progress(video_view_count);

-- Create a function to increment video view count
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

-- Create RLS policy for the function if needed
CREATE POLICY "Users can increment their own video view count" ON user_exercise_progress
    FOR UPDATE USING (auth.uid() = user_id);