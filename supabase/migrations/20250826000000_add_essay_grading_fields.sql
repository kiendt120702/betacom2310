-- Add grading fields to edu_essay_submissions table
ALTER TABLE edu_essay_submissions 
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS grader_feedback TEXT,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending';

-- Add check constraint for status values
ALTER TABLE edu_essay_submissions 
ADD CONSTRAINT IF NOT EXISTS essay_status_check 
CHECK (status IN ('pending', 'graded'));

-- Add index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_essay_submissions_status ON edu_essay_submissions(status);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_exercise_status ON edu_essay_submissions(exercise_id, status);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_user_status ON edu_essay_submissions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_essay_submissions_submitted_at ON edu_essay_submissions(submitted_at) WHERE submitted_at IS NOT NULL;