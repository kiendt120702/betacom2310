-- FIX CRITICAL: Infinite recursion in profiles RLS policy
-- The issue is that we're querying the profiles table within its own RLS policy

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Leaders can view team member profiles" ON public.profiles;

-- Create a simpler, non-recursive policy for leaders
CREATE POLICY "Leaders can view team member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'leader'::user_role 
  AND manager_id = auth.uid()
);

-- Also ensure we have proper policies for other operations
-- The existing policies should work fine, but let's make sure they're correctly ordered

-- Update the admin policy to be more specific
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);