
-- Create enum for work type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_type') THEN
    CREATE TYPE public.work_type AS ENUM ('fulltime', 'parttime');
  END IF;
END $$;

-- Create roles management table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add phone and work_type columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'work_type') THEN
    ALTER TABLE public.profiles ADD COLUMN work_type work_type DEFAULT 'fulltime';
  END IF;
END $$;

-- Add RLS policies for roles table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'roles') THEN
    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Admins can manage all roles') THEN
    CREATE POLICY "Admins can manage all roles" 
      ON public.roles 
      FOR ALL 
      USING (get_user_role(auth.uid()) = 'admin'::user_role);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Authenticated users can view roles') THEN
    CREATE POLICY "Authenticated users can view roles" 
      ON public.roles 
      FOR SELECT 
      USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Thêm một số vai trò mặc định
INSERT INTO public.roles (name, description) VALUES 
  ('Admin', 'Quản trị viên hệ thống'),
  ('Leader', 'Trưởng nhóm'),
  ('Chuyên viên', 'Nhân viên chuyên môn'),
  ('Thực tập sinh', 'Nhân viên thực tập');
