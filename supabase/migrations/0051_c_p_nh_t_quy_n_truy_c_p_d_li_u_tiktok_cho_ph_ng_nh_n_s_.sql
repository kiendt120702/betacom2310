-- Create a function to check if the user is an HR viewer
CREATE OR REPLACE FUNCTION public.is_hr_viewer()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.sys_profiles p
    JOIN public.sys_departments d ON p.department_id = d.id
    WHERE p.id = auth.uid() AND p.role = 'chuyên viên'::public.user_role AND d.name = 'Phòng Nhân Sự'
  );
$function$;

-- Update policy on tiktok_shops to allow HR viewers to see shops
DROP POLICY IF EXISTS "Tiktok shops SELECT access" ON public.tiktok_shops;
CREATE POLICY "Tiktok shops SELECT access" ON public.tiktok_shops
FOR SELECT
USING (
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'trưởng phòng'::user_role])) OR
  is_special_viewer() OR
  is_hr_viewer() OR
  (
    (get_user_role(auth.uid()) = 'leader'::user_role) AND
    (EXISTS (
      SELECT 1
      FROM sys_profiles p
      WHERE p.id = tiktok_shops.profile_id AND p.manager_id = auth.uid()
    ))
  ) OR
  (profile_id = auth.uid())
);

-- Update policy on tiktok_comprehensive_reports to allow HR viewers to see reports
DROP POLICY IF EXISTS "Tiktok reports SELECT access" ON public.tiktok_comprehensive_reports;
CREATE POLICY "Tiktok reports SELECT access" ON public.tiktok_comprehensive_reports
FOR SELECT
USING (
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'trưởng phòng'::user_role])) OR
  is_special_viewer() OR
  is_hr_viewer() OR
  (
    (get_user_role(auth.uid()) = 'leader'::user_role) AND
    (EXISTS (
      SELECT 1
      FROM tiktok_shops s
      JOIN sys_profiles p ON s.profile_id = p.id
      WHERE s.id = tiktok_comprehensive_reports.shop_id AND p.manager_id = auth.uid()
    ))
  ) OR
  (EXISTS (
    SELECT 1
    FROM tiktok_shops s
    WHERE s.id = tiktok_comprehensive_reports.shop_id AND s.profile_id = auth.uid()
  ))
);