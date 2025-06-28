
-- Update RLS policies for profiles table to allow leaders to manage their team members
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Leaders can manage team profiles" ON public.profiles;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile and admins to view all profiles
-- Leaders can view profiles from their team
CREATE POLICY "Users can view accessible profiles" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'leader' AND 
     team = (SELECT team FROM public.profiles WHERE id = auth.uid()))
  );

-- Allow admins to insert any profile, leaders can insert profiles for their team
CREATE POLICY "Authorized users can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'leader' AND 
     team = (SELECT team FROM public.profiles WHERE id = auth.uid()))
  );

-- Allow admins to update any profile, leaders can update profiles in their team
-- Users can update their own profile
CREATE POLICY "Authorized users can update profiles" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'leader' AND 
     team = (SELECT team FROM public.profiles WHERE id = auth.uid()))
  );

-- Allow admins to delete any profile, leaders can delete profiles in their team
-- Users cannot delete their own profile to prevent accidental deletion
CREATE POLICY "Authorized users can delete profiles" ON public.profiles
  FOR DELETE USING (
    public.get_user_role(auth.uid()) = 'admin' OR
    (public.get_user_role(auth.uid()) = 'leader' AND 
     team = (SELECT team FROM public.profiles WHERE id = auth.uid()) AND
     auth.uid() != id) -- Prevent leaders from deleting themselves
  );
