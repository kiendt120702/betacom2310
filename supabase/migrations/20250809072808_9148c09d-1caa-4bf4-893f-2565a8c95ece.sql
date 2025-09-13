
-- Add order_index column to training_courses table
-- Note: training_courses table does not exist, skipping all operations

/*
-- Commented out because training_courses table doesn't exist
ALTER TABLE training_courses 
ADD COLUMN order_index INTEGER DEFAULT 0;

-- Update existing records to have proper order_index values
UPDATE training_courses 
SET order_index = ROW_NUMBER() OVER (ORDER BY created_at);

-- Make order_index NOT NULL after setting values
ALTER TABLE training_courses 
ALTER COLUMN order_index SET NOT NULL;
*/
