-- Update admin account exercise progress for testing
-- This ensures the admin account has proper test data

-- First, let's create some sample exercise progress for the admin user
-- We'll assume the admin user exists and has some exercises
DO $$
DECLARE
    admin_user_id UUID;
    exercise_record RECORD;
BEGIN
    -- Find admin user (assuming there's a profile with admin role)
    SELECT auth_id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin'
    LIMIT 1;
    
    -- If admin user exists, create/update progress for all exercises
    IF admin_user_id IS NOT NULL THEN
        -- Loop through all exercises and ensure there's progress data
        FOR exercise_record IN 
            SELECT id, order_index FROM edu_knowledge_exercises ORDER BY order_index
        LOOP
            -- Insert or update progress for each exercise
            INSERT INTO user_exercise_progress (
                user_id, 
                exercise_id, 
                is_completed,
                video_completed,
                recap_submitted,
                completed_at,
                time_spent
            ) VALUES (
                admin_user_id,
                exercise_record.id,
                CASE 
                    -- Complete first 2 exercises for testing sequential unlock
                    WHEN exercise_record.order_index < 2 THEN true
                    ELSE false
                END,
                CASE 
                    -- Mark first 3 exercises as video completed
                    WHEN exercise_record.order_index < 3 THEN true
                    ELSE false
                END,
                CASE 
                    -- Mark first 2 exercises as recap submitted
                    WHEN exercise_record.order_index < 2 THEN true
                    ELSE false
                END,
                CASE 
                    WHEN exercise_record.order_index < 2 THEN NOW()
                    ELSE NULL
                END,
                CASE 
                    WHEN exercise_record.order_index < 3 THEN 300 -- 5 minutes
                    ELSE 0
                END
            )
            ON CONFLICT (user_id, exercise_id) 
            DO UPDATE SET
                is_completed = EXCLUDED.is_completed,
                video_completed = EXCLUDED.video_completed,
                recap_submitted = EXCLUDED.recap_submitted,
                completed_at = EXCLUDED.completed_at,
                time_spent = EXCLUDED.time_spent,
                updated_at = NOW();
        END LOOP;
        
        RAISE NOTICE 'Updated exercise progress for admin user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'No admin user found to update progress';
    END IF;
END $$;

-- Also create some sample recap data for the completed exercises
DO $$
DECLARE
    admin_user_id UUID;
    exercise_record RECORD;
BEGIN
    -- Find admin user
    SELECT auth_id INTO admin_user_id 
    FROM profiles 
    WHERE role = 'admin'
    LIMIT 1;
    
    -- If admin user exists, create recap data for first 2 exercises
    IF admin_user_id IS NOT NULL THEN
        FOR exercise_record IN 
            SELECT id, title, order_index 
            FROM edu_knowledge_exercises 
            WHERE order_index < 2 
            ORDER BY order_index
        LOOP
            INSERT INTO user_exercise_recaps (
                user_id,
                exercise_id,
                recap_content
            ) VALUES (
                admin_user_id,
                exercise_record.id,
                'Tóm tắt bài học: ' || exercise_record.title || '. Tôi đã học được các kiến thức cơ bản và áp dụng thành công vào thực tế. Bài học rất hữu ích và giúp tôi hiểu rõ hơn về chủ đề này.'
            )
            ON CONFLICT (user_id, exercise_id) 
            DO UPDATE SET
                recap_content = EXCLUDED.recap_content,
                updated_at = NOW();
        END LOOP;
        
        RAISE NOTICE 'Created recap data for admin user exercises';
    END IF;
END $$;