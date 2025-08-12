
-- Thêm 2 cột mới vào bảng edu_knowledge_exercises
ALTER TABLE edu_knowledge_exercises 
ADD COLUMN min_study_sessions INTEGER DEFAULT 1 NOT NULL,
ADD COLUMN min_review_videos INTEGER DEFAULT 0 NOT NULL;
