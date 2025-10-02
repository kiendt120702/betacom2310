-- First, drop the function that depends on the column
DROP FUNCTION IF EXISTS public.get_user_team_id(user_id uuid);

-- Then, rename the column
ALTER TABLE public.sys_profiles RENAME COLUMN team_id TO department_id;

-- Rename the foreign key constraint for consistency
ALTER TABLE public.sys_profiles RENAME CONSTRAINT profiles_team_id_fkey TO profiles_department_id_fkey;

-- Finally, recreate the function with the new column name and a new function name
CREATE OR REPLACE FUNCTION public.get_user_department_id(user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT department_id FROM public.sys_profiles WHERE id = user_id;
$function$;