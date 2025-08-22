-- Thêm cột theory_read và quiz_passed vào bảng user_exercise_progress
ALTER TABLE user_exercise_progress 
ADD COLUMN theory_read BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN quiz_passed BOOLEAN NOT NULL DEFAULT false;

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX idx_user_exercise_progress_theory_read ON user_exercise_progress(theory_read);
CREATE INDEX idx_user_exercise_progress_quiz_passed ON user_exercise_progress(quiz_passed);