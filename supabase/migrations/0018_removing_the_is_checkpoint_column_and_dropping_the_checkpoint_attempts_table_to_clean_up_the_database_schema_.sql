-- Drop the checkpoint_attempts table
DROP TABLE IF EXISTS public.checkpoint_attempts;

-- Remove the is_checkpoint column from edu_knowledge_exercises
ALTER TABLE public.edu_knowledge_exercises
DROP COLUMN IF EXISTS is_checkpoint;