
-- Tạo bảng cho các bài tập kiến thức edu
CREATE TABLE edu_knowledge_exercises (
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

-- Tạo bảng theo dõi tiến độ bài tập của user
CREATE TABLE user_exercise_progress (
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

-- Policies cho edu_knowledge_exercises
CREATE POLICY "Admins can manage edu exercises" 
  ON edu_knowledge_exercises 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Authenticated users can view edu exercises" 
  ON edu_knowledge_exercises 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Policies cho user_exercise_progress  
CREATE POLICY "Users can view their own exercise progress" 
  ON user_exercise_progress 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own exercise progress" 
  ON user_exercise_progress 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own exercise progress" 
  ON user_exercise_progress 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all exercise progress" 
  ON user_exercise_progress 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Tạo index cho hiệu suất
CREATE INDEX idx_edu_exercises_order_index ON edu_knowledge_exercises(order_index);
CREATE INDEX idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX idx_user_exercise_progress_exercise_id ON user_exercise_progress(exercise_id);

-- Thêm unique constraint cho order_index
ALTER TABLE edu_knowledge_exercises ADD CONSTRAINT edu_exercises_order_index_unique UNIQUE (order_index);
