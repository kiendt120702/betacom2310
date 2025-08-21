
-- Create table for system updates
CREATE TABLE public.system_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('cải tiến', 'thiết kế lại', 'tính năng mới', 'cập nhật', 'sửa lỗi')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  version TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_updates ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view system updates
CREATE POLICY "Anyone can view system updates" 
  ON public.system_updates 
  FOR SELECT 
  USING (true);

-- Only admins can manage system updates
CREATE POLICY "Admins can manage system updates" 
  ON public.system_updates 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Create index for better performance
CREATE INDEX idx_system_updates_created_at ON public.system_updates(created_at DESC);
CREATE INDEX idx_system_updates_type ON public.system_updates(type);
