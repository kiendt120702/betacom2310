-- Thêm cột 'type' vào bảng tiktok_shops với giá trị mặc định là 'Vận hành'
ALTER TABLE "public"."tiktok_shops"
ADD COLUMN IF NOT EXISTS "type" "public"."tiktok_shop_type" NOT NULL DEFAULT 'Vận hành';

-- Cập nhật hàm để lấy TẤT CẢ các shop TikTok, không loại bỏ các shop trùng tên
CREATE OR REPLACE FUNCTION public.get_all_tiktok_shops_for_dashboard()
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
    SELECT json_agg(shops_with_details)
    FROM (
        SELECT
            ts.*, -- Lấy tất cả các cột từ bảng tiktok_shops
            (
                SELECT jsonb_build_object(
                    'id', p.id,
                    'full_name', p.full_name,
                    'email', p.email,
                    'team_id', p.team_id,
                    'manager_id', p.manager_id,
                    'manager', (
                        SELECT jsonb_build_object(
                            'id', m.id,
                            'full_name', m.full_name,
                            'email', m.email
                        )
                        FROM public.profiles m
                        WHERE m.id = p.manager_id
                    )
                )
                FROM public.profiles p
                WHERE p.id = ts.profile_id
            ) as profile
        FROM public.tiktok_shops ts -- Truy vấn trực tiếp từ bảng tiktok_shops
    ) as shops_with_details;
$function$;