
-- Complete fix for RLS policies to eliminate infinite recursion
-- Drop ALL existing policies first to start clean
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authorized users can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view accessible profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;

-- Create simple, non-recursive policies
-- Users can always read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles (using the get_user_role function)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Leaders can read profiles in their team
CREATE POLICY "Leaders can read team profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.get_user_role(auth.uid()) = 'leader' AND 
    team = (SELECT team FROM public.profiles WHERE id = auth.uid())
  );

-- Leaders can update profiles in their team
CREATE POLICY "Leaders can update team profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    public.get_user_role(auth.uid()) = 'leader' AND 
    team = (SELECT team FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'leader' AND 
    team = (SELECT team FROM public.profiles WHERE id = auth.uid())
  );

-- Allow profile creation during signup
CREATE POLICY "Allow profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can insert any profile
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- Leaders can insert profiles for their team
CREATE POLICY "Leaders can insert team profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'leader' AND 
    team = (SELECT team FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can delete any profile
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (public.get_user_role(auth.uid()) = 'admin');

-- Leaders can delete profiles in their team (except themselves)
CREATE POLICY "Leaders can delete team profiles"
  ON public.profiles
  FOR DELETE
  USING (
    public.get_user_role(auth.uid()) = 'leader' AND 
    team = (SELECT team FROM public.profiles WHERE id = auth.uid()) AND
    auth.uid() != id
  );
