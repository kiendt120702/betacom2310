
-- Tạo bảng để lưu trữ recap của người dùng cho mỗi bài tập
CREATE TABLE user_exercise_recaps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  recap_content TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Thêm RLS cho bảng user_exercise_recaps
ALTER TABLE user_exercise_recaps ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user xem recap của chính mình
CREATE POLICY "Users can view their own recaps"
  ON user_exercise_recaps
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy cho phép user tạo recap cho chính mình
CREATE POLICY "Users can create their own recaps"
  ON user_exercise_recaps
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy cho phép user cập nhật recap của chính mình
CREATE POLICY "Users can update their own recaps"
  ON user_exercise_recaps
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy cho phép admin xem tất cả recap
CREATE POLICY "Admins can view all recaps"
  ON user_exercise_recaps
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Thêm trường để theo dõi xem video đã hoàn thành chưa
ALTER TABLE user_exercise_progress 
ADD COLUMN video_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN recap_submitted BOOLEAN NOT NULL DEFAULT false;

-- Tạo index để tăng hiệu suất
CREATE INDEX idx_user_exercise_recaps_user_exercise ON user_exercise_recaps(user_id, exercise_id);
