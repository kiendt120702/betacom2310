-- Fix remaining recursive policies that cause infinite recursion

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view manager information" ON public.profiles;

-- Drop recursive policies on other tables that reference profiles
DROP POLICY IF EXISTS "Users can view shopee shops" ON public.shopee_shops;
DROP POLICY IF EXISTS "Users can view comprehensive reports" ON public.comprehensive_reports;

-- Create simple, non-recursive policies for profiles table
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create simple policies for other tables without referencing profiles
CREATE POLICY "shopee_shops_select_authenticated" ON public.shopee_shops
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "comprehensive_reports_select_authenticated" ON public.comprehensive_reports
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopee_shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprehensive_reports ENABLE ROW LEVEL SECURITY;