-- Drop policies on profile_segment_roles
DROP POLICY IF EXISTS "Leaders can manage their team in each segment" ON public.profile_segment_roles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profile_segment_roles;
DROP POLICY IF EXISTS "Users can view their own segment roles" ON public.profile_segment_roles;

-- Drop trigger on profile_segment_roles
DROP TRIGGER IF EXISTS handle_updated_at ON public.profile_segment_roles;