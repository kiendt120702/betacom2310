-- Add grading fields to edu_essay_submissions table (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'edu_essay_submissions') THEN
        ALTER TABLE edu_essay_submissions 
        ADD COLUMN IF NOT EXISTS score INTEGER,
        ADD COLUMN IF NOT EXISTS grader_feedback TEXT,
        ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';
    END IF;
END $$;

-- Add check constraint for status values (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'edu_essay_submissions') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE table_name = 'edu_essay_submissions' AND constraint_name = 'essay_status_check') THEN
            ALTER TABLE edu_essay_submissions 
            ADD CONSTRAINT essay_status_check 
            CHECK (status IN ('pending', 'graded'));
        END IF;
    END IF;
END $$;

-- Add index for performance on common queries (only if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'edu_essay_submissions') THEN
        CREATE INDEX IF NOT EXISTS idx_essay_submissions_status ON edu_essay_submissions(status);
        CREATE INDEX IF NOT EXISTS idx_essay_submissions_exercise_status ON edu_essay_submissions(exercise_id, status);
        CREATE INDEX IF NOT EXISTS idx_essay_submissions_user_status ON edu_essay_submissions(user_id, status);
        CREATE INDEX IF NOT EXISTS idx_essay_submissions_submitted_at ON edu_essay_submissions(submitted_at) WHERE submitted_at IS NOT NULL;
    END IF;
END $$;