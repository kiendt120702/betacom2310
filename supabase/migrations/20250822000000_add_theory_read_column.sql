-- Thêm cột theory_read và quiz_passed vào bảng user_exercise_progress
-- Check if columns exist first to avoid conflicts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_exercise_progress' AND column_name = 'theory_read') THEN
        ALTER TABLE user_exercise_progress ADD COLUMN theory_read BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_exercise_progress' AND column_name = 'quiz_passed') THEN
        ALTER TABLE user_exercise_progress ADD COLUMN quiz_passed BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_theory_read ON user_exercise_progress(theory_read);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_quiz_passed ON user_exercise_progress(quiz_passed);