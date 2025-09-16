-- Bảng chính để quản lý vai trò và leader theo từng segment
CREATE TABLE public.profile_segment_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES public.segments(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Leader của nhân viên trong segment này
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, segment_id) -- Mỗi nhân viên chỉ có 1 vai trò trong 1 segment
);

-- Trigger để tự động cập nhật updated_at
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.profile_segment_roles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Bật RLS cho bảng mới
ALTER TABLE public.profile_segment_roles ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS:
-- 1. Admin có toàn quyền
-- 2. Nhân viên có thể xem các phân công của chính mình
-- 3. Leader có thể xem/sửa các phân công của nhân viên mà họ quản lý trong segment đó
CREATE POLICY "Admins have full access" ON public.profile_segment_roles
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own segment roles" ON public.profile_segment_roles
    FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Leaders can manage their team in each segment" ON public.profile_segment_roles
    FOR ALL USING (manager_id = auth.uid());