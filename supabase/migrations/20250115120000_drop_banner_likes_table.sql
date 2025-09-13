-- Drop banner_likes table and related functions/policies

-- Drop functions that depend on banner_likes table
DROP FUNCTION IF EXISTS toggle_banner_like(UUID);
DROP FUNCTION IF EXISTS get_banner_likes(UUID, UUID);

-- Drop policies (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'banner_likes') THEN
        DROP POLICY IF EXISTS "Anyone can view banner likes" ON banner_likes;
        DROP POLICY IF EXISTS "Users can like banners" ON banner_likes;
        DROP POLICY IF EXISTS "Users can unlike banners" ON banner_likes;
        DROP POLICY IF EXISTS "Admins can manage all banner likes" ON banner_likes;
    END IF;
END $$;

-- Drop trigger (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'banner_likes') THEN
        DROP TRIGGER IF EXISTS update_banner_likes_updated_at ON banner_likes;
    END IF;
END $$;

-- Drop indexes
DROP INDEX IF EXISTS idx_banner_likes_user_id;
DROP INDEX IF EXISTS idx_banner_likes_banner_id;
DROP INDEX IF EXISTS idx_banner_likes_created_at;

-- Drop the table
DROP TABLE IF EXISTS banner_likes;