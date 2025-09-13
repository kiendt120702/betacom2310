
-- Create table to store user recaps for each exercise
CREATE TABLE IF NOT EXISTS user_exercise_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  recap_content TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Enable RLS for user_exercise_recaps table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'user_exercise_recaps') THEN
    ALTER TABLE user_exercise_recaps ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policies for user_exercise_recaps
DO $$
BEGIN
  -- Policy to allow users to view their own recaps
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_exercise_recaps' AND policyname = 'Users can view their own recaps') THEN
    CREATE POLICY "Users can view their own recaps"
      ON user_exercise_recaps
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  -- Policy to allow users to create their own recaps
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_exercise_recaps' AND policyname = 'Users can create their own recaps') THEN
    CREATE POLICY "Users can create their own recaps"
      ON user_exercise_recaps
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  -- Policy to allow users to update their own recaps
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_exercise_recaps' AND policyname = 'Users can update their own recaps') THEN
    CREATE POLICY "Users can update their own recaps"
      ON user_exercise_recaps
      FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  -- Policy to allow admins to view all recaps
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_exercise_recaps' AND policyname = 'Admins can view all recaps') THEN
    CREATE POLICY "Admins can view all recaps"
      ON user_exercise_recaps
      FOR SELECT
      USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;
END $$;

-- Add fields to track video completion and recap submission
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_exercise_progress' AND column_name = 'video_completed') THEN
    ALTER TABLE user_exercise_progress ADD COLUMN video_completed BOOLEAN NOT NULL DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_exercise_progress' AND column_name = 'recap_submitted') THEN
    ALTER TABLE user_exercise_progress ADD COLUMN recap_submitted BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create index for performance improvement
CREATE INDEX IF NOT EXISTS idx_user_exercise_recaps_user_exercise ON user_exercise_recaps(user_id, exercise_id);
