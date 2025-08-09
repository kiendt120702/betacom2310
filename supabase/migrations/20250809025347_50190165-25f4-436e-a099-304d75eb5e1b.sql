
-- Tạo bảng theo dõi tiến độ học tập của user
CREATE TABLE public.user_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  completed_study_sessions INTEGER NOT NULL DEFAULT 0,
  completed_review_videos INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Tạo bảng theo dõi tiến độ xem video
CREATE TABLE public.user_video_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  video_id UUID REFERENCES public.training_videos(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  watch_count INTEGER NOT NULL DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- Tạo bảng bài tập/assignment
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.training_courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tạo bảng nộp bài tập
CREATE TABLE public.assignment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  feedback TEXT,
  reviewed_by UUID REFERENCES auth.users,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, user_id)
);

-- Thiết lập RLS cho các bảng mới
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies cho user_course_progress
CREATE POLICY "Users can view their own course progress" 
  ON public.user_course_progress 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own course progress" 
  ON public.user_course_progress 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own course progress" 
  ON public.user_course_progress 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all course progress" 
  ON public.user_course_progress 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies cho user_video_progress
CREATE POLICY "Users can manage their own video progress" 
  ON public.user_video_progress 
  FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all video progress" 
  ON public.user_video_progress 
  FOR SELECT 
  USING (get_user_role(auth.uid()) = 'admin');

-- RLS policies cho assignments
CREATE POLICY "Admins can manage assignments" 
  ON public.assignments 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Authenticated users can view assignments" 
  ON public.assignments 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- RLS policies cho assignment_submissions
CREATE POLICY "Users can manage their own submissions" 
  ON public.assignment_submissions 
  FOR ALL 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all submissions" 
  ON public.assignment_submissions 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin');
