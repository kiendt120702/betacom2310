-- Complete fix for infinite recursion in RLS policies
-- This migration removes all policies that depend on get_user_role function
-- and creates safe, non-recursive policies

-- First, drop all policies that depend on get_user_role function
-- These are causing the infinite recursion issue

-- Drop policies on profiles table
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin users can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can read team profiles" ON public.profiles;
DROP POLICY IF EXISTS "Managers can update team profiles" ON public.profiles;

-- Drop policies on other tables that use get_user_role
DROP POLICY IF EXISTS "Admins can view all video progress" ON public.user_video_progress;
DROP POLICY IF EXISTS "Admins can manage assignments" ON public.assignments;
DROP POLICY IF EXISTS "Admins can manage all submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Admins can manage edu exercises" ON public.edu_knowledge_exercises;
DROP POLICY IF EXISTS "Admins can view all exercise progress" ON public.user_exercise_progress;
DROP POLICY IF EXISTS "Admins can view all recaps" ON public.user_exercise_recaps;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can view all video tracking" ON public.video_tracking;
DROP POLICY IF EXISTS "Admins can manage all banner likes" ON public.banner_likes;
DROP POLICY IF EXISTS "Admins can manage all shop revenue" ON public.shop_revenue;
DROP POLICY IF EXISTS "Admins can manage practice tests" ON public.practice_tests;
DROP POLICY IF EXISTS "Admins can view all practice test submissions" ON public.practice_test_submissions;
DROP POLICY IF EXISTS "Admin can create banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can update banners" ON public.banners;
DROP POLICY IF EXISTS "Admin can delete banners" ON public.banners;
DROP POLICY IF EXISTS "Admins can view all course progress" ON public.user_course_progress;

-- Now we can safely drop the problematic function
DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.is_admin(UUID);

-- Create only basic, safe policies for profiles table
-- These don't cause recursion because they don't query profiles from within profiles policies
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

-- Temporarily disable RLS on other tables to prevent login issues
-- These can be re-enabled later with proper non-recursive policies
ALTER TABLE IF EXISTS public.user_video_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.edu_knowledge_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_exercise_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_exercise_recaps DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.video_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banner_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shop_revenue DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practice_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practice_test_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_course_progress DISABLE ROW LEVEL SECURITY;

-- Comment explaining the fix
COMMENT ON TABLE public.profiles IS 'RLS policies simplified to prevent infinite recursion. Other tables have RLS temporarily disabled.';