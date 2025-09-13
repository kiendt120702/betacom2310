-- Create banner_likes table to track user likes on banners
-- Note: Foreign key to banners table removed as it doesn't exist
CREATE TABLE IF NOT EXISTS banner_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, banner_id) -- Prevent duplicate likes from same user
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banner_likes_user_id ON banner_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_banner_likes_banner_id ON banner_likes(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_likes_created_at ON banner_likes(created_at DESC);

-- Enable RLS
ALTER TABLE banner_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for banner_likes
-- Users can view all likes (to see like counts)
CREATE POLICY "Anyone can view banner likes" 
  ON banner_likes 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Users can only insert their own likes
CREATE POLICY "Users can like banners" 
  ON banner_likes 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Users can only delete their own likes
CREATE POLICY "Users can unlike banners" 
  ON banner_likes 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Admins can view all likes
CREATE POLICY "Admins can manage all banner likes" 
  ON banner_likes 
  FOR ALL 
  USING (get_user_role(auth.uid()) = 'admin'::user_role);

-- Function to get banner like count and user's like status
CREATE OR REPLACE FUNCTION get_banner_likes(banner_id_param UUID, user_id_param UUID DEFAULT NULL)
RETURNS TABLE(
  like_count BIGINT,
  user_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as like_count,
    CASE 
      WHEN user_id_param IS NULL THEN false
      ELSE COUNT(CASE WHEN user_id = user_id_param THEN 1 END) > 0
    END as user_liked
  FROM banner_likes 
  WHERE banner_id = banner_id_param;
END;
$$;

-- Function to toggle like status
CREATE OR REPLACE FUNCTION toggle_banner_like(banner_id_param UUID)
RETURNS TABLE(
  like_count BIGINT,
  user_liked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id UUID;
  existing_like_id UUID;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  -- Check if user already liked this banner
  SELECT id INTO existing_like_id
  FROM banner_likes 
  WHERE user_id = current_user_id AND banner_id = banner_id_param;
  
  IF existing_like_id IS NOT NULL THEN
    -- User already liked, so unlike (delete)
    DELETE FROM banner_likes WHERE id = existing_like_id;
  ELSE
    -- User hasn't liked, so like (insert)
    INSERT INTO banner_likes (user_id, banner_id) 
    VALUES (current_user_id, banner_id_param);
  END IF;
  
  -- Return updated like count and user status
  RETURN QUERY
  SELECT * FROM get_banner_likes(banner_id_param, current_user_id);
END;
$$;

-- Create updated_at trigger for banner_likes
CREATE TRIGGER update_banner_likes_updated_at
    BEFORE UPDATE ON banner_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();