
-- Thêm cột team vào bảng profiles
ALTER TABLE public.profiles ADD COLUMN team text;

-- Cập nhật một số team mẫu cho testing
UPDATE public.profiles 
SET team = 'Marketing Team' 
WHERE email = 'betacom.work@gmail.com';

-- Tạo function để check quyền tạo user
CREATE OR REPLACE FUNCTION public.can_create_user_role(creator_role user_role, target_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT CASE 
    WHEN creator_role = 'admin' AND target_role IN ('admin', 'leader', 'chuyên viên') THEN true
    WHEN creator_role = 'leader' AND target_role = 'chuyên viên' THEN true
    ELSE false
  END;
$$;
