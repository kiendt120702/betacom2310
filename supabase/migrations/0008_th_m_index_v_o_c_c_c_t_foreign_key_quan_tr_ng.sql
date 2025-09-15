-- Thêm index cho các cột foreign key thường dùng
CREATE INDEX IF NOT EXISTS idx_shopee_shops_profile_id ON public.shopee_shops(profile_id);
CREATE INDEX IF NOT EXISTS idx_tiktok_shops_profile_id ON public.tiktok_shops(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_team_id ON public.profiles(team_id);
CREATE INDEX IF NOT EXISTS idx_profiles_manager_id ON public.profiles(manager_id);
CREATE INDEX IF NOT EXISTS idx_edu_knowledge_exercises_created_by ON public.edu_knowledge_exercises(created_by);
CREATE INDEX IF NOT EXISTS idx_thumbnail_banners_user_id ON public.thumbnail_banners(user_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_banners_category_id ON public.thumbnail_banners(thumbnail_category_id);
CREATE INDEX IF NOT EXISTS idx_thumbnail_banners_type_id ON public.thumbnail_banners(thumbnail_type_id);