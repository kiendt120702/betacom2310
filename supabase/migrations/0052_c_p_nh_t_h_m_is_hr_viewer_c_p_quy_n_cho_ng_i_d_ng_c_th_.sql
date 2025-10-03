CREATE OR REPLACE FUNCTION public.is_hr_viewer()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.sys_profiles p
    LEFT JOIN public.sys_departments d ON p.department_id = d.id
    WHERE 
      p.id = auth.uid() AND 
      (
        (p.role = 'chuyên viên'::public.user_role AND d.name = 'Phòng Nhân Sự') OR
        (p.email = 'lethihau@betacom.site')
      )
  );
$function$