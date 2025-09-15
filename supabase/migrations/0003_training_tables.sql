CREATE TABLE public.edu_knowledge_exercises (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title text NOT NULL,
    order_index integer NOT NULL DEFAULT 0,
    is_required boolean NOT NULL DEFAULT true,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    exercise_video_url text,
    min_study_sessions integer NOT NULL DEFAULT 1,
    min_review_videos integer NOT NULL DEFAULT 0,
    required_review_videos integer NOT NULL DEFAULT 3,
    target_roles public.user_role[],
    target_team_ids uuid[],
    documents jsonb,
    required_viewing_count integer NOT NULL DEFAULT 1,
    min_completion_time integer,
    CONSTRAINT edu_knowledge_exercises_pkey PRIMARY KEY (id),
    CONSTRAINT edu_knowledge_exercises_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE TABLE public.edu_quizzes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    exercise_id uuid NOT NULL,
    title text NOT NULL,
    passing_score smallint NOT NULL DEFAULT 80,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quizzes_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quizzes_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.edu_knowledge_exercises(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_questions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    content text NOT NULL,
    question_type public.question_type NOT NULL DEFAULT 'single_choice'::public.question_type,
    order_index smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quiz_questions_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_questions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.edu_quizzes(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_answers (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    question_id uuid NOT NULL,
    content text NOT NULL,
    is_correct boolean NOT NULL DEFAULT false,
    order_index smallint DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT edu_quiz_answers_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_answers_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.edu_quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE public.edu_quiz_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    quiz_id uuid NOT NULL,
    user_id uuid NOT NULL,
    score smallint NOT NULL,
    passed boolean NOT NULL,
    submitted_at timestamp with time zone DEFAULT now(),
    answers jsonb,
    CONSTRAINT edu_quiz_submissions_pkey PRIMARY KEY (id),
    CONSTRAINT edu_quiz_submissions_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.edu_quizzes(id) ON DELETE CASCADE,
    CONSTRAINT edu_quiz_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE public.user_exercise_progress (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    is_completed boolean NOT NULL DEFAULT false,
    completed_at timestamp with time zone,
    time_spent integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    video_completed boolean NOT NULL DEFAULT false,
    recap_submitted boolean NOT NULL DEFAULT false,
    quiz_passed boolean NOT NULL DEFAULT false,
    video_duration integer,
    session_count integer NOT NULL DEFAULT 1,
    theory_read boolean NOT NULL DEFAULT false,
    watch_percentage integer DEFAULT 0,
    video_view_count integer NOT NULL DEFAULT 0,
    CONSTRAINT user_exercise_progress_pkey PRIMARY KEY (id),
    CONSTRAINT user_exercise_progress_user_id_exercise_id_key UNIQUE (user_id, exercise_id),
    CONSTRAINT user_exercise_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_exercise_progress_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.edu_knowledge_exercises(id) ON DELETE CASCADE
);