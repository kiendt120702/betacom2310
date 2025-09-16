-- Thêm phòng ban "Phòng Vận Hành" nếu chưa có
INSERT INTO public.departments (name)
VALUES ('Phòng Vận Hành')
ON CONFLICT (name) DO NOTHING;

-- Thêm 2 mảng công việc cho Phòng Vận Hành
DO $$
DECLARE
    v_department_id UUID;
BEGIN
    -- Lấy ID của phòng Vận Hành
    SELECT id INTO v_department_id FROM public.departments WHERE name = 'Phòng Vận Hành';

    -- Thêm segment Shopee và TikTok nếu chưa có
    IF v_department_id IS NOT NULL THEN
        INSERT INTO public.segments (department_id, name)
        VALUES (v_department_id, 'Shopee')
        ON CONFLICT (department_id, name) DO NOTHING;

        INSERT INTO public.segments (department_id, name)
        VALUES (v_department_id, 'TikTok')
        ON CONFLICT (department_id, name) DO NOTHING;
    END IF;
END $$;