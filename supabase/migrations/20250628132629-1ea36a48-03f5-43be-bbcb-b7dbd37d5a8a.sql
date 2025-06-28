
-- Fix RLS policies to ensure admin access works properly
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can delete profiles" ON public.profiles;

-- Create new policies with proper admin access
-- Allow users to view their own profile, admins to view all profiles, leaders to view their team
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2 
      WHERE p1.id = auth.uid() AND p1.role = 'leader' 
      AND p2.id = profiles.id AND p2.team = p1.team
    )
  );

-- Allow admins to insert any profile, leaders can insert profiles for their team
CREATE POLICY "Authorized users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p1
      WHERE p1.id = auth.uid() AND p1.role = 'leader' 
      AND team = p1.team
    )
  );

-- Allow users to update their own profile, admins to update any profile, leaders to update their team
CREATE POLICY "Authorized users can update profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2 
      WHERE p1.id = auth.uid() AND p1.role = 'leader' 
      AND p2.id = profiles.id AND p2.team = p1.team
    )
  );

-- Allow admins to delete any profile, leaders can delete profiles in their team (except themselves)
CREATE POLICY "Authorized users can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM public.profiles p1, public.profiles p2 
      WHERE p1.id = auth.uid() AND p1.role = 'leader' 
      AND p2.id = profiles.id AND p2.team = p1.team
      AND profiles.id != auth.uid()
    )
  );
