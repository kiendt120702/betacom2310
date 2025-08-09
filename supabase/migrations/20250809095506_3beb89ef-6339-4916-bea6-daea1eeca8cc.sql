
-- Tạo bảng để lưu trữ các video ôn tập được nộp
CREATE TABLE public.exercise_review_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  exercise_id UUID NOT NULL REFERENCES public.edu_knowledge_exercises(id),
  content TEXT NOT NULL, -- Nội dung ôn tập
  video_url TEXT NOT NULL, -- Link drive của video ôn tập
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Thêm RLS policies
ALTER TABLE public.exercise_review_submissions ENABLE ROW LEVEL SECURITY;

-- Chuyên viên chỉ có thể xem và quản lý video ôn tập của mình
CREATE POLICY "Users can manage their own review submissions" 
  ON public.exercise_review_submissions 
  FOR ALL 
  USING (user_id = auth.uid());

-- Admin có thể xem tất cả
CREATE POLICY "Admins can view all review submissions" 
  ON public.exercise_review_submissions 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Tạo index cho hiệu suất
CREATE INDEX idx_exercise_review_submissions_user_exercise 
  ON public.exercise_review_submissions(user_id, exercise_id);

CREATE INDEX idx_exercise_review_submissions_exercise 
  ON public.exercise_review_submissions(exercise_id);
