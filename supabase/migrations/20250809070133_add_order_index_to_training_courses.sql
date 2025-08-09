-- Add order_index field to training_courses table for proper progression sequencing
ALTER TABLE training_courses ADD COLUMN order_index INTEGER;

-- Set order_index based on current created_at order for existing courses
UPDATE training_courses 
SET order_index = subquery.row_number 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_number 
  FROM training_courses
) AS subquery 
WHERE training_courses.id = subquery.id;

-- Make order_index required for future records
ALTER TABLE training_courses ALTER COLUMN order_index SET NOT NULL;

-- Add unique constraint to ensure no duplicate order_index
ALTER TABLE training_courses ADD CONSTRAINT training_courses_order_index_unique UNIQUE (order_index);

-- Create index for better performance
CREATE INDEX idx_training_courses_order_index ON training_courses(order_index);