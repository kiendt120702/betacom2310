-- Create user_video_progress table to track video completion progress
-- Note: training_videos and training_courses tables do not exist, creating without foreign key constraints
CREATE TABLE IF NOT EXISTS user_video_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid NOT NULL, -- Removed foreign key constraint as training_videos table doesn't exist
  course_id uuid NOT NULL, -- Removed foreign key constraint as training_courses table doesn't exist
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Unique constraint to prevent duplicate progress entries
  UNIQUE(user_id, video_id)
);

-- Enable RLS
ALTER TABLE user_video_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own video progress" ON user_video_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own video progress" ON user_video_progress
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_video_progress_user_id ON user_video_progress(user_id);
CREATE INDEX idx_user_video_progress_course_id ON user_video_progress(course_id);
CREATE INDEX idx_user_video_progress_video_id ON user_video_progress(video_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_video_progress_updated_at 
  BEFORE UPDATE ON user_video_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();