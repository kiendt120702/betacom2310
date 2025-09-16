-- Đổi tên bảng teams thành departments để rõ ràng hơn
ALTER TABLE public.teams RENAME TO departments;

-- Tạo bảng segments để lưu các mảng công việc (Shopee, TikTok)
CREATE TABLE public.segments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, name)
);

-- Bật RLS cho bảng segments
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- Chính sách RLS cho segments: Admin quản lý, người khác có thể xem
CREATE POLICY "Admin can manage segments" ON public.segments
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');
CREATE POLICY "Authenticated users can view segments" ON public.segments
    FOR SELECT USING (auth.role() = 'authenticated');