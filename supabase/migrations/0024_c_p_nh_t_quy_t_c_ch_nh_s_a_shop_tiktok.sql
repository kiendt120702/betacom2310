ALTER POLICY "Restrict tiktok_shop access to authorized users" ON public.tiktok_shops
USING (((get_user_role(auth.uid()) = 'admin'::user_role) OR (profile_id = auth.uid())))
WITH CHECK (((get_user_role(auth.uid()) = 'admin'::user_role) OR (profile_id = auth.uid())));