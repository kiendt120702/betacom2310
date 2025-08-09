
-- Create training_courses table
CREATE TABLE public.training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  min_study_sessions INTEGER NOT NULL DEFAULT 1,
  min_review_videos INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Create training_videos table
CREATE TABLE public.training_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.training_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT NOT NULL,
  duration INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_review_video BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for training_courses
CREATE POLICY "Authenticated users can view training courses" 
  ON public.training_courses 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage training courses" 
  ON public.training_courses 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create RLS policies for training_videos
CREATE POLICY "Authenticated users can view training videos" 
  ON public.training_videos 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage training videos" 
  ON public.training_videos 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create indexes for better performance
CREATE INDEX idx_training_videos_course_id ON public.training_videos(course_id);
CREATE INDEX idx_training_videos_order ON public.training_videos(course_id, order_index);
CREATE INDEX idx_training_courses_created_at ON public.training_courses(created_at DESC);
