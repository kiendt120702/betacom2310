-- Add indexes for better search performance on profiles table

-- Index for full_name search (case insensitive)
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_gin 
ON profiles USING gin(to_tsvector('simple', full_name));

-- Index for email search (case insensitive) 
CREATE INDEX IF NOT EXISTS idx_profiles_email_gin
ON profiles USING gin(to_tsvector('simple', email));

-- Indexes for non-existent columns removed (role, team_id do not exist in profiles table)
-- CREATE INDEX IF NOT EXISTS idx_profiles_role_team_created
-- ON profiles(role, team_id, created_at DESC);

-- CREATE INDEX IF NOT EXISTS idx_profiles_team_id
-- ON profiles(team_id) WHERE role != 'deleted';

-- CREATE INDEX IF NOT EXISTS idx_profiles_role
-- ON profiles(role) WHERE role != 'deleted';

-- Combined text search index for full_name and email
CREATE INDEX IF NOT EXISTS idx_profiles_fulltext_search
ON profiles USING gin((
  setweight(to_tsvector('simple', coalesce(full_name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(email, '')), 'B')
));