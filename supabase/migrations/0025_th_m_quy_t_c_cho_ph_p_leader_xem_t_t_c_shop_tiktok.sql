CREATE POLICY "Leaders can view all tiktok shops" ON public.tiktok_shops
FOR SELECT USING ((get_user_role(auth.uid()) = 'leader'::user_role));