
-- Tạo bảng training_courses (khóa học đào tạo)
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  min_study_sessions INTEGER NOT NULL DEFAULT 1,
  min_review_videos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Tạo bảng training_videos (video đào tạo)
CREATE TABLE public.training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER, -- thời lượng video tính bằng giây
  order_index INTEGER NOT NULL DEFAULT 0,
  is_review_video BOOLEAN NOT NULL DEFAULT false, -- true nếu là video ôn tập
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Tạo bảng training_assignments (bài tập đào tạo)
CREATE TABLE public.training_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users NOT NULL
);

-- Tạo bảng user_course_progress (tiến độ học tập của user)
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  completed_study_sessions INTEGER NOT NULL DEFAULT 0,
  completed_review_videos INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Tạo bảng assignment_submissions (nộp bài tập)
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.training_assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  file_urls JSONB, -- lưu danh sách file đính kèm
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded', 'returned')),
  score INTEGER, -- điểm số nếu có
  feedback TEXT, -- feedback từ admin
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE,
  graded_by UUID REFERENCES auth.users,
  UNIQUE(assignment_id, user_id)
);

-- Tạo bảng video_watch_history (lịch sử xem video)
CREATE TABLE public.video_watch_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id UUID REFERENCES public.training_videos(id) ON DELETE CASCADE NOT NULL,
  watch_count INTEGER NOT NULL DEFAULT 1,
  last_watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Enable RLS cho tất cả các bảng
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_watch_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies cho training_courses
CREATE POLICY "Everyone can view training courses" ON public.training_courses FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can manage training courses" ON public.training_courses FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies cho training_videos
CREATE POLICY "Everyone can view training videos" ON public.training_videos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can manage training videos" ON public.training_videos FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies cho training_assignments
CREATE POLICY "Everyone can view training assignments" ON public.training_assignments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only admins can manage training assignments" ON public.training_assignments FOR ALL USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies cho user_course_progress
CREATE POLICY "Users can view their own progress" ON public.user_course_progress FOR SELECT USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own progress" ON public.user_course_progress FOR UPDATE USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies cho assignment_submissions
CREATE POLICY "Users can view their own submissions" ON public.assignment_submissions FOR SELECT USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "Users can submit assignments" ON public.assignment_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own submissions" ON public.assignment_submissions FOR UPDATE USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "Only admins can delete submissions" ON public.assignment_submissions FOR DELETE USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- RLS Policies cho video_watch_history
CREATE POLICY "Users can view their own watch history" ON public.video_watch_history FOR SELECT USING (user_id = auth.uid() OR get_user_role(auth.uid()) = 'admin'::user_role);
CREATE POLICY "Users can track their own watch history" ON public.video_watch_history FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own watch history" ON public.video_watch_history FOR UPDATE USING (user_id = auth.uid());

-- Tạo function để cập nhật tiến độ học tập
CREATE OR REPLACE FUNCTION public.update_course_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_TABLE_NAME = 'video_watch_history' THEN
    -- Cập nhật số lần xem video
    INSERT INTO user_course_progress (user_id, course_id, completed_study_sessions, completed_review_videos)
    SELECT 
      NEW.user_id,
      tv.course_id,
      CASE WHEN tv.is_review_video = false THEN 1 ELSE 0 END,
      CASE WHEN tv.is_review_video = true THEN 1 ELSE 0 END
    FROM training_videos tv
    WHERE tv.id = NEW.video_id
    ON CONFLICT (user_id, course_id) DO UPDATE SET
      completed_study_sessions = CASE 
        WHEN (SELECT is_review_video FROM training_videos WHERE id = NEW.video_id) = false 
        THEN user_course_progress.completed_study_sessions + 1
        ELSE user_course_progress.completed_study_sessions
      END,
      completed_review_videos = CASE 
        WHEN (SELECT is_review_video FROM training_videos WHERE id = NEW.video_id) = true 
        THEN user_course_progress.completed_review_videos + 1
        ELSE user_course_progress.completed_review_videos
      END,
      updated_at = now(),
      last_accessed_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Tạo trigger để tự động cập nhật tiến độ
CREATE TRIGGER update_progress_on_video_watch
  AFTER INSERT ON public.video_watch_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_progress();
