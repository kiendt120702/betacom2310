-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.user_permissions;
DROP TABLE IF EXISTS public.profile_segment_roles;

-- Now drop the tables they depended on
DROP TABLE IF EXISTS public.permissions;
DROP TABLE IF EXISTS public.segments;