-- Add admin RLS policies for profiles
-- Admins may read any profile
CREATE POLICY "Admins can read profiles"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id OR public.get_user_role(auth.uid()) = 'admin');

-- Admins may update any profile
CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (public.get_user_role(auth.uid()) = 'admin')
  WITH CHECK (public.get_user_role(auth.uid()) = 'admin');
