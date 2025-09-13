-- Add manager_id column to profiles table
-- Check if column exists first to avoid conflicts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'manager_id') THEN
        ALTER TABLE public.profiles ADD COLUMN manager_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

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