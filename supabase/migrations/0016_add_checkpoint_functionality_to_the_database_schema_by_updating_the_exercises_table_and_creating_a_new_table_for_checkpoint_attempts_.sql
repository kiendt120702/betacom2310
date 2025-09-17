-- Add is_checkpoint column to edu_knowledge_exercises
ALTER TABLE public.edu_knowledge_exercises
ADD COLUMN is_checkpoint BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.edu_knowledge_exercises.is_checkpoint IS 'Marks the exercise as a major checkpoint test.';

-- Create checkpoint_attempts table
CREATE TABLE public.checkpoint_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.edu_knowledge_exercises(id) ON DELETE CASCADE,
    answers JSONB,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT user_checkpoint_unique UNIQUE(user_id, exercise_id)
);

COMMENT ON TABLE public.checkpoint_attempts IS 'Stores user submissions for checkpoint tests.';

-- Enable RLS
ALTER TABLE public.checkpoint_attempts ENABLE ROW LEVEL SECURITY;

-- Policies for checkpoint_attempts
CREATE POLICY "Users can insert their own checkpoint attempts"
ON public.checkpoint_attempts
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own checkpoint attempts"
ON public.checkpoint_attempts
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all checkpoint attempts"
ON public.checkpoint_attempts
FOR ALL TO authenticated
USING ( (get_user_role(auth.uid()) = 'admin'::user_role) );