-- CRITICAL SECURITY FIX: Restrict profiles table access
-- Replace overly permissive policy that allows all users to view all profiles

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create new restrictive policies for profiles access
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Leaders can view team member profiles" 
ON public.profiles 
FOR SELECT 
USING (
  get_user_role(auth.uid()) = 'leader'::user_role 
  AND EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = profiles.id 
    AND p.manager_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- CRITICAL SECURITY FIX: Secure permissions system
-- Remove public access to permissions and role_permissions tables

-- Fix permissions table access
DROP POLICY IF EXISTS "Anyone can view permissions" ON public.permissions;
DROP POLICY IF EXISTS "Only admins can modify permissions" ON public.permissions;

CREATE POLICY "Only admins can view permissions" 
ON public.permissions 
FOR SELECT 
USING (get_user_role(auth.uid()) = 'admin'::user_role);

CREATE POLICY "Only admins can manage permissions" 
ON public.permissions 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- Fix role_permissions table if it exists
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id uuid REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_id)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view role permissions" ON public.role_permissions;

CREATE POLICY "Only admins can manage role permissions" 
ON public.role_permissions 
FOR ALL 
USING (get_user_role(auth.uid()) = 'admin'::user_role)
WITH CHECK (get_user_role(auth.uid()) = 'admin'::user_role);

-- HIGH PRIORITY SECURITY FIX: Add search_path to security definer functions
-- This prevents privilege escalation attacks

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS user_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.get_cached_user_role()
RETURNS user_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cached_role user_role;
BEGIN
  -- Use pg_advisory_xact_lock to ensure thread safety
  PERFORM pg_advisory_xact_lock(hashtext('user_role_' || auth.uid()::text));
  
  SELECT role INTO cached_role 
  FROM profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(cached_role, 'chuyên viên'::user_role);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_team_id(user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id FROM public.profiles WHERE id = user_id;
$$;

CREATE OR REPLACE FUNCTION public.is_active_user(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role <> 'deleted'::public.user_role
  );
END;
$$;

-- MEDIUM PRIORITY: Restrict organizational data access
-- Require authentication for teams, tags, and categories

DROP POLICY IF EXISTS "Anyone can view categories" ON public.thumbnail_categories;
CREATE POLICY "Authenticated users can view categories" 
ON public.thumbnail_categories 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view tags" ON public.tags;
CREATE POLICY "Authenticated users can view tags" 
ON public.tags 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Add audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_profiles_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log role changes and sensitive updates
  IF TG_OP = 'UPDATE' AND (OLD.role != NEW.role OR OLD.email != NEW.email OR OLD.manager_id != NEW.manager_id) THEN
    INSERT INTO audit_log (table_name, operation, old_values, new_values, user_id, timestamp)
    VALUES ('profiles', TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), NOW());
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for profile auditing
DROP TRIGGER IF EXISTS trigger_audit_profiles ON public.profiles;
CREATE TRIGGER trigger_audit_profiles
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_profiles_changes();