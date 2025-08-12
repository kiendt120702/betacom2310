
-- Tạo bảng để lưu thông tin số video ôn tập yêu cầu cho mỗi bài tập
ALTER TABLE edu_knowledge_exercises 
ADD COLUMN required_review_videos integer NOT NULL DEFAULT 3;

-- Cập nhật dữ liệu mẫu cho các bài tập hiện tại
UPDATE edu_knowledge_exercises 
SET required_review_videos = 5 
WHERE required_review_videos = 3;

-- Tạo index để tăng hiệu suất truy vấn
CREATE INDEX IF NOT EXISTS idx_exercise_review_submissions_exercise_user 
ON exercise_review_submissions(exercise_id, user_id);
