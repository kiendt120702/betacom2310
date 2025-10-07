-- Drop existing mutation policies on tiktok_comprehensive_reports to avoid conflicts
DROP POLICY IF EXISTS "Restrict tiktok report access based on shop ownership and role" ON public.tiktok_comprehensive_reports;
DROP POLICY IF EXISTS "Tiktok reports MUTATE access" ON public.tiktok_comprehensive_reports;

-- Create a new, clear policy for INSERT, UPDATE, DELETE
CREATE POLICY "Allow mutation for authorized users on TikTok reports"
ON public.tiktok_comprehensive_reports
FOR ALL
TO authenticated
USING (true) -- This allows the policy to apply to all rows for checking
WITH CHECK (
  (get_user_role(auth.uid()) = 'admin'::user_role)
  OR
  -- Allow shop owner to mutate their own reports
  (EXISTS (
    SELECT 1
    FROM public.tiktok_shops s
    WHERE s.id = shop_id AND s.profile_id = auth.uid()
  ))
  OR
  -- Allow leader/manager to mutate reports of shops owned by their team members
  ((get_user_role(auth.uid()) = ANY (ARRAY['leader'::user_role, 'trưởng phòng'::user_role])) AND (EXISTS (
    SELECT 1
    FROM public.tiktok_shops s
    JOIN public.sys_profiles p ON s.profile_id = p.id
    WHERE s.id = shop_id AND p.manager_id = auth.uid()
  )))
);