-- Tạo bảng để theo dõi thời gian xem video của người dùng
CREATE TABLE video_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL REFERENCES edu_knowledge_exercises(id) ON DELETE CASCADE,
  total_watch_time INTEGER NOT NULL DEFAULT 0, -- Tổng thời gian xem (giây)
  video_duration INTEGER NOT NULL DEFAULT 0, -- Tổng thời lượng video (giây)
  watch_percentage INTEGER NOT NULL DEFAULT 0, -- Phần trăm đã xem (0-100)
  last_position INTEGER NOT NULL DEFAULT 0, -- Vị trí dừng cuối cùng (giây)
  session_count INTEGER NOT NULL DEFAULT 1, -- Số lần xem video
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Thêm RLS cho bảng video_tracking
ALTER TABLE video_tracking ENABLE ROW LEVEL SECURITY;

-- Policy cho phép user xem thống kê của chính mình
CREATE POLICY "Users can view their own video tracking"
  ON video_tracking
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy cho phép user tạo/cập nhật tracking của chính mình
CREATE POLICY "Users can upsert their own video tracking"
  ON video_tracking
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own video tracking"
  ON video_tracking
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy cho phép admin xem tất cả tracking
CREATE POLICY "Admins can view all video tracking"
  ON video_tracking
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Tạo index để tăng hiệu suất
CREATE INDEX idx_video_tracking_user_exercise ON video_tracking(user_id, exercise_id);
CREATE INDEX idx_video_tracking_user_id ON video_tracking(user_id);
CREATE INDEX idx_video_tracking_exercise_id ON video_tracking(exercise_id);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_video_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER video_tracking_updated_at
  BEFORE UPDATE ON video_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_video_tracking_updated_at();