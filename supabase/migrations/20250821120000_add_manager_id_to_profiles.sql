-- Add manager_id column to profiles table
ALTER TABLE public.profiles ADD COLUMN manager_id UUID REFERENCES public.profiles(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);

-- Update RLS policies to allow reading manager information
CREATE POLICY "Users can view manager information" 
  ON public.profiles 
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() 
      AND (p.role = 'admin' OR p.role = 'leader')
    )
  );