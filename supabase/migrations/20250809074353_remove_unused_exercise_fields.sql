-- Remove unused fields from edu_knowledge_exercises table
ALTER TABLE edu_knowledge_exercises 
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS content,
DROP COLUMN IF EXISTS min_completion_time;