-- Fix all recursive RLS policies that reference profiles table
-- This migration removes circular dependencies by simplifying admin checks

-- Drop all problematic policies that cause recursion (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Only admins can modify permissions" ON public.permissions;
DROP POLICY IF EXISTS "Only admins can modify role permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Only admins can modify user permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "Only admins can view all login sessions" ON public.user_login_sessions;
DROP POLICY IF EXISTS "Users can view their own active sessions" ON public.user_active_sessions;
DROP POLICY IF EXISTS "Users can view their own login history" ON public.user_login_sessions;
DROP POLICY IF EXISTS "Users can view their own permission overrides" ON public.user_permissions;

-- Disable RLS on tables that cause issues
ALTER TABLE IF EXISTS public.permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_login_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_active_sessions DISABLE ROW LEVEL SECURITY;

-- Ensure profiles table has simple, non-recursive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);