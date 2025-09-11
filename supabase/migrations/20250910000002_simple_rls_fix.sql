-- Immediate fix for infinite recursion - drop problematic policies and use simple ones
-- This is a safer approach that doesn't require complex cache tables

-- Drop all current RLS policies on profiles that might cause recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can read team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update team profiles" ON public.profiles;

-- Replace get_user_role calls in policies with direct role checks
-- This avoids the circular dependency issue

-- Basic policies that don't call functions
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

-- Simple admin policies using direct role comparison (no function calls)
CREATE POLICY "Admin users can read all profiles"
  ON public.profiles 
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin users can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p  
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin users can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admin users can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Manager/Leader policies
CREATE POLICY "Managers can read team profiles"
  ON public.profiles
  FOR SELECT
  USING (
    manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'manager', 'leader')
      AND profiles.manager_id = auth.uid()
    )
  );

CREATE POLICY "Managers can update team profiles"
  ON public.profiles  
  FOR UPDATE
  USING (
    manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager', 'leader') 
      AND profiles.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    manager_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager', 'leader')
      AND profiles.manager_id = auth.uid()
    )
  );