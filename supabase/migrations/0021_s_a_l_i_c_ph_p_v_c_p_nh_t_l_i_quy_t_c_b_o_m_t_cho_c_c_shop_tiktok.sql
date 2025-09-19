-- First, drop the existing policy if it exists
DROP POLICY IF EXISTS "Restrict tiktok_shop access to authorized users" ON public.tiktok_shops;

-- Then, create the new policy with the correct logic
CREATE POLICY "Restrict tiktok_shop access to authorized users"
ON public.tiktok_shops
FOR ALL
USING (
  (get_user_role(auth.uid()) = 'admin'::user_role) OR
  (profile_id = auth.uid()) OR
  (auth.email() = 'truongthiquynh@betacom.site'::text)
)
WITH CHECK (
  (get_user_role(auth.uid()) = 'admin'::user_role) OR
  (profile_id = auth.uid()) OR
  (auth.email() = 'truongthiquynh@betacom.site'::text)
);