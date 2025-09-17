-- Add configurable essay question count per exercise
ALTER TABLE public.edu_knowledge_exercises
  ADD COLUMN IF NOT EXISTS essay_questions_per_test integer NOT NULL DEFAULT 5;

-- Ensure existing rows have a concrete value (in case column was just added)
UPDATE public.edu_knowledge_exercises
SET essay_questions_per_test = COALESCE(essay_questions_per_test, 5);

-- Allow storing text-based practice test submissions and make image uploads optional
ALTER TABLE public.practice_test_submissions
  ALTER COLUMN image_urls DROP NOT NULL,
  ALTER COLUMN image_urls SET DEFAULT ARRAY[]::text[];

ALTER TABLE public.practice_test_submissions
  ADD COLUMN IF NOT EXISTS submission_text text;

-- Recreate start_essay_test function with configurable question count support
DROP FUNCTION IF EXISTS public.start_essay_test(uuid, integer);
DROP FUNCTION IF EXISTS public.start_essay_test(uuid);

CREATE OR REPLACE FUNCTION public.start_essay_test(
  p_exercise_id uuid,
  p_time_limit integer DEFAULT 30,
  p_question_count integer DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_question_count integer;
  v_questions json;
  v_submission public.edu_essay_submissions;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  SELECT COALESCE(p_question_count, e.essay_questions_per_test, 5)
  INTO v_question_count
  FROM public.edu_knowledge_exercises e
  WHERE e.id = p_exercise_id;

  IF v_question_count IS NULL OR v_question_count <= 0 THEN
    v_question_count := 5;
  END IF;

  SELECT json_agg(json_build_object('id', q.id, 'content', q.content))
  INTO v_questions
  FROM (
    SELECT id, content
    FROM public.edu_essay_questions
    WHERE exercise_id = p_exercise_id
    ORDER BY random()
    LIMIT v_question_count
  ) q;

  IF v_questions IS NULL OR json_array_length(v_questions) = 0 THEN
    RAISE EXCEPTION 'Không có câu hỏi nào cho bài tập này';
  END IF;

  SELECT *
  INTO v_submission
  FROM public.edu_essay_submissions
  WHERE exercise_id = p_exercise_id
    AND user_id = v_user_id
  LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.edu_essay_submissions (
      exercise_id,
      user_id,
      answers,
      started_at,
      submitted_at,
      status,
      time_limit_minutes,
      created_at,
      updated_at
    )
    VALUES (
      p_exercise_id,
      v_user_id,
      v_questions,
      now(),
      NULL,
      'in_progress',
      p_time_limit,
      now(),
      now()
    )
    RETURNING * INTO v_submission;
  ELSE
    UPDATE public.edu_essay_submissions
    SET answers = v_questions,
        started_at = now(),
        submitted_at = NULL,
        status = 'in_progress',
        score = NULL,
        grader_feedback = NULL,
        time_limit_minutes = p_time_limit,
        updated_at = now()
    WHERE id = v_submission.id
    RETURNING * INTO v_submission;
  END IF;

  RETURN row_to_json(v_submission);
END;
$$;
