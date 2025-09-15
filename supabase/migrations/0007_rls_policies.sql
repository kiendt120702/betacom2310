ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (get_user_role(auth.uid()) = 'admin'::public.user_role);

ALTER TABLE public.shopee_shops ENABLE ROW LEVEL SECURITY;
-- ... (Thêm tất cả các policy khác cho tất cả các bảng vào đây)