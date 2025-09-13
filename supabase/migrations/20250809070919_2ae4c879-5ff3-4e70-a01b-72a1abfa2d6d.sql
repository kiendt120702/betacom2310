
-- Create table for edu knowledge exercises
CREATE TABLE IF NOT EXISTS edu_knowledge_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  min_completion_time INTEGER DEFAULT 5, -- thời gian tối thiểu hoàn thành (phút)
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to track user exercise progress
CREATE TABLE IF NOT EXISTS user_exercise_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER DEFAULT 0, -- thời gian đã dành (phút)
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Add Row Level Security
ALTER TABLE edu_knowledge_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_progress ENABLE ROW LEVEL SECURITY;

-- Policies for edu_knowledge_exercises (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'edu_knowledge_exercises' AND policyname = 'Admins can manage edu exercises'
  ) THEN
    CREATE POLICY "Admins can manage edu exercises" 
      ON edu_knowledge_exercises 
      FOR ALL 
      USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'edu_knowledge_exercises' AND policyname = 'Authenticated users can view edu exercises'
  ) THEN
    CREATE POLICY "Authenticated users can view edu exercises" 
      ON edu_knowledge_exercises 
      FOR SELECT 
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Policies for user_exercise_progress (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_exercise_progress' AND policyname = 'Users can view their own exercise progress'
  ) THEN
    CREATE POLICY "Users can view their own exercise progress" 
      ON user_exercise_progress 
      FOR SELECT 
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_exercise_progress' AND policyname = 'Users can insert their own exercise progress'
  ) THEN
    CREATE POLICY "Users can insert their own exercise progress" 
      ON user_exercise_progress 
      FOR INSERT 
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_exercise_progress' AND policyname = 'Users can update their own exercise progress'
  ) THEN
    CREATE POLICY "Users can update their own exercise progress" 
      ON user_exercise_progress 
      FOR UPDATE 
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_exercise_progress' AND policyname = 'Admins can view all exercise progress'
  ) THEN
    CREATE POLICY "Admins can view all exercise progress" 
      ON user_exercise_progress 
      FOR SELECT 
      USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;
END $$;

-- Create indexes for performance (skip if already exists)
CREATE INDEX IF NOT EXISTS idx_edu_exercises_order_index ON edu_knowledge_exercises(order_index);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_exercise_id ON user_exercise_progress(exercise_id);

-- Add unique constraint for order_index (skip if already exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'edu_exercises_order_index_unique'
  ) THEN
    ALTER TABLE edu_knowledge_exercises ADD CONSTRAINT edu_exercises_order_index_unique UNIQUE (order_index);
  END IF;
END $$;
