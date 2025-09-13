-- Drop all existing SELECT policies on the profiles table to clean up any recursive policies.
DROP POLICY IF EXISTS "Allow profile viewing based on role" ON public.profiles;
DROP POLICY IF EXISTS "Users can view manager information" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create a single, non-recursive policy that allows any authenticated user to see any profile.
-- This resolves the infinite recursion error during login and profile fetching.
CREATE POLICY "Authenticated users can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (true);