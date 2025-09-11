-- Emergency fix: Temporarily disable complex RLS policies to stop infinite recursion
-- This allows the app to function while a proper solution is implemented

-- Drop ALL policies that could cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;  
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can read team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete profiles" ON public.profiles;

-- Keep only the basic non-recursive policies
-- These are safe because they don't query the profiles table

-- Users can always read and update their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT  
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow profile creation during signup  
CREATE POLICY "Allow profile creation"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Temporary broad read access to unblock the application
-- TODO: Replace with proper role-based policies once recursion is resolved
CREATE POLICY "Authenticated users can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comment explaining the situation
-- This migration is a temporary fix to resolve the infinite recursion issue
-- The proper solution requires implementing a role caching mechanism
-- or restructuring the RLS policies to avoid circular dependencies