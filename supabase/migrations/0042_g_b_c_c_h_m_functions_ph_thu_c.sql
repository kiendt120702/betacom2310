-- Drop functions that depend on the tables to be removed
DROP FUNCTION IF EXISTS public.update_role_permissions(p_role user_role, p_permission_ids uuid[]);
DROP FUNCTION IF EXISTS public.check_permission(p_user_id uuid, p_permission_name text);
DROP FUNCTION IF EXISTS public.update_user_permission_overrides(p_user_id uuid, p_permission_overrides jsonb);