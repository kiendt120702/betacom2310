-- Add required viewing count field for video requirements
-- This field specifies how many times a user must watch a video to complete the requirement
ALTER TABLE edu_knowledge_exercises 
ADD COLUMN IF NOT EXISTS required_viewing_count INTEGER NOT NULL DEFAULT 1;