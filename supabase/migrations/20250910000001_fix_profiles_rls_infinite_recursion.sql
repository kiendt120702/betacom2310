-- Fix infinite recursion in profiles RLS policies
-- The issue is that get_user_role function calls profiles table which triggers RLS policies again
-- Solution: Simplify policies to avoid calling functions that query the same table

-- Drop ALL problematic policies first
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can read team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update team profiles" ON public.profiles;

-- Temporarily disable RLS to avoid the recursion issue
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Create a lookup table for user roles to avoid querying profiles table in RLS policies
CREATE TABLE IF NOT EXISTS public.user_roles_cache (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on the cache table
ALTER TABLE public.user_roles_cache ENABLE ROW LEVEL SECURITY;

-- Simple policy for user_roles_cache
CREATE POLICY "Users can read own role cache"
  ON public.user_roles_cache
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a trigger to keep the cache updated
CREATE OR REPLACE FUNCTION update_user_roles_cache()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles_cache (user_id, role, updated_at)
  VALUES (NEW.id, NEW.role, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = NEW.role,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_update_user_roles_cache ON public.profiles;
CREATE TRIGGER trigger_update_user_roles_cache
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_roles_cache();

-- Populate the cache with existing data
INSERT INTO public.user_roles_cache (user_id, role, updated_at)
SELECT id, role, now() 
FROM public.profiles 
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = now();

-- Create a simple function that uses the cache
CREATE OR REPLACE FUNCTION public.get_cached_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.user_roles_cache WHERE user_id = get_cached_role.user_id),
    'chuyên viên'::user_role
  );
$$;

-- Re-enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies that don't create recursion
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.get_cached_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update all profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_cached_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_cached_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.get_cached_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (public.get_cached_role(auth.uid()) = 'admin');

-- Create simplified manager/leader policies
CREATE POLICY "Managers can read team profiles"
  ON public.profiles
  FOR SELECT
  USING (
    public.get_cached_role(auth.uid()) IN ('admin', 'manager', 'leader') 
    AND manager_id = auth.uid()
  );

CREATE POLICY "Managers can update team profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    public.get_cached_role(auth.uid()) IN ('admin', 'manager', 'leader') 
    AND manager_id = auth.uid()
  )
  WITH CHECK (
    public.get_cached_role(auth.uid()) IN ('admin', 'manager', 'leader') 
    AND manager_id = auth.uid()
  );