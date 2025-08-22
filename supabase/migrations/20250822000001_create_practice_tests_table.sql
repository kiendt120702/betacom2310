-- Tạo bảng practice_tests để lưu trữ bài tập thực hành
CREATE TABLE practice_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  max_score INTEGER NOT NULL DEFAULT 100,
  passing_score INTEGER NOT NULL DEFAULT 60,
  time_limit INTEGER NOT NULL DEFAULT 30, -- thời gian làm bài (phút)
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraint
  CONSTRAINT practice_tests_exercise_id_fkey 
  FOREIGN KEY (exercise_id) 
  REFERENCES edu_knowledge_exercises(id) 
  ON DELETE CASCADE
);

-- Tạo bảng practice_test_submissions để lưu trữ bài làm của học viên
CREATE TABLE practice_test_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_test_id UUID NOT NULL,
  user_id UUID NOT NULL,
  answers JSONB NOT NULL, -- lưu trữ câu trả lời dưới dạng JSON
  score INTEGER,
  is_passed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  time_spent INTEGER, -- thời gian làm bài (phút)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT practice_test_submissions_practice_test_id_fkey 
  FOREIGN KEY (practice_test_id) 
  REFERENCES practice_tests(id) 
  ON DELETE CASCADE,
  
  -- Unique constraint - mỗi user chỉ được làm một lần cho mỗi bài test
  UNIQUE(practice_test_id, user_id)
);

-- Enable RLS
ALTER TABLE practice_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_test_submissions ENABLE ROW LEVEL SECURITY;

-- Policies cho practice_tests
CREATE POLICY "Authenticated users can view active practice tests"
  ON practice_tests
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins can manage practice tests"
  ON practice_tests
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Policies cho practice_test_submissions
CREATE POLICY "Users can view their own practice test submissions"
  ON practice_test_submissions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own practice test submissions"
  ON practice_test_submissions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own practice test submissions"
  ON practice_test_submissions
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all practice test submissions"
  ON practice_test_submissions
  FOR SELECT
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Tạo indexes để tăng hiệu suất
CREATE INDEX idx_practice_tests_exercise_id ON practice_tests(exercise_id);
CREATE INDEX idx_practice_tests_is_active ON practice_tests(is_active);
CREATE INDEX idx_practice_test_submissions_practice_test_id ON practice_test_submissions(practice_test_id);
CREATE INDEX idx_practice_test_submissions_user_id ON practice_test_submissions(user_id);
CREATE INDEX idx_practice_test_submissions_is_passed ON practice_test_submissions(is_passed);

-- Thêm trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_tests_updated_at
  BEFORE UPDATE ON practice_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER practice_test_submissions_updated_at
  BEFORE UPDATE ON practice_test_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();