import type { Json } from "./database"
import type { PublicEnums } from "./schema-public-enums"

export type PublicTables = {
  audit_log: {
    Row: {
      id: string
      new_values: Json | null
      old_values: Json | null
      operation: string
      table_name: string
      timestamp: string | null
      user_id: string | null
    }
    Insert: {
      id?: string
      new_values?: Json | null
      old_values?: Json | null
      operation: string
      table_name: string
      timestamp?: string | null
      user_id?: string | null
    }
    Update: {
      id?: string
      new_values?: Json | null
      old_values?: Json | null
      operation?: string
      table_name?: string
      timestamp?: string | null
      user_id?: string | null
    }
    Relationships: []
  }
  checkpoint_attempts: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      answers: Json | null
      submitted_at: string
      created_at: string
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      answers?: Json | null
      submitted_at?: string
      created_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      answers?: Json | null
      submitted_at?: string
      created_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "checkpoint_attempts_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "checkpoint_attempts_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  sys_departments: {
    Row: {
      created_at: string
      id: string
      name: string
    }
    Insert: {
      created_at?: string
      id?: string
      name: string
    }
    Update: {
      created_at?: string
      id?: string
      name?: string
    }
    Relationships: []
  }
  edu_essay_questions: {
    Row: {
      content: string
      created_at: string
      exercise_id: string
      id: string
      updated_at: string
    }
    Insert: {
      content: string
      created_at?: string
      exercise_id: string
      id?: string
      updated_at?: string
    }
    Update: {
      content?: string
      created_at?: string
      exercise_id?: string
      id?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "edu_essay_questions_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_essay_submissions: {
    Row: {
      answers: Json | null
      created_at: string
      exercise_id: string
      grader_feedback: string | null
      id: string
      score: number | null
      started_at: string | null
      status: string | null
      submitted_at: string | null
      time_limit_minutes: number | null
      updated_at: string
      user_id: string
    }
    Insert: {
      answers?: Json | null
      created_at?: string
      exercise_id: string
      grader_feedback?: string | null
      id?: string
      score?: number | null
      started_at?: string | null
      status?: string | null
      submitted_at?: string | null
      time_limit_minutes?: number | null
      updated_at?: string
      user_id: string
    }
    Update: {
      answers?: Json | null
      created_at?: string
      exercise_id?: string
      grader_feedback?: string | null
      id?: string
      score?: number | null
      started_at?: string | null
      status?: string | null
      submitted_at?: string | null
      time_limit_minutes?: number | null
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "edu_essay_submissions_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "edu_essay_submissions_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_knowledge_exercises: {
    Row: {
      created_at: string
      created_by: string
      documents: Json | null
      essay_questions_per_test: number
      exercise_video_url: string | null
      id: string
      is_checkpoint: boolean
      is_required: boolean
      min_completion_time: number | null
      min_review_videos: number
      min_study_sessions: number
      order_index: number
      required_review_videos: number
      required_viewing_count: number
      target_roles: string[] | null
      target_team_ids: string[] | null
      title: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by: string
      documents?: Json | null
      essay_questions_per_test?: number
      exercise_video_url?: string | null
      id?: string
      is_checkpoint?: boolean
      is_required?: boolean
      min_completion_time?: number | null
      min_review_videos?: number
      min_study_sessions?: number
      order_index?: number
      required_review_videos?: number
      required_viewing_count?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      title: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string
      documents?: Json | null
      essay_questions_per_test?: number
      exercise_video_url?: string | null
      id?: string
      is_checkpoint?: boolean
      is_required?: boolean
      min_completion_time?: number | null
      min_review_videos?: number
      min_study_sessions?: number
      order_index?: number
      required_review_videos?: number
      required_viewing_count?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      title?: string
      updated_at?: string
    }
    Relationships: []
  }
  edu_quiz_answers: {
    Row: {
      content: string
      created_at: string | null
      id: string
      is_correct: boolean
      order_index: number | null
      question_id: string
      updated_at: string | null
    }
    Insert: {
      content: string
      created_at?: string | null
      id?: string
      is_correct?: boolean
      order_index?: number | null
      question_id: string
      updated_at?: string | null
    }
    Update: {
      content?: string
      created_at?: string | null
      id?: string
      is_correct?: boolean
      order_index?: number | null
      question_id?: string
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "edu_quiz_answers_question_id_fkey"
        columns: ["question_id"]
        isOneToOne: false
        referencedRelation: "edu_quiz_questions"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_quiz_questions: {
    Row: {
      content: string
      created_at: string | null
      id: string
      order_index: number | null
      question_type: PublicEnums["question_type"]
      quiz_id: string
      updated_at: string | null
    }
    Insert: {
      content: string
      created_at?: string | null
      id?: string
      order_index?: number | null
      question_type?: PublicEnums["question_type"]
      quiz_id: string
      updated_at?: string | null
    }
    Update: {
      content?: string
      created_at?: string | null
      id?: string
      order_index?: number | null
      question_type?: PublicEnums["question_type"]
      quiz_id?: string
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "edu_quiz_questions_quiz_id_fkey"
        columns: ["quiz_id"]
        isOneToOne: false
        referencedRelation: "edu_quizzes"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_quiz_submissions: {
    Row: {
      answers: Json | null
      id: string
      passed: boolean
      quiz_id: string
      score: number
      submitted_at: string | null
      user_id: string
    }
    Insert: {
      answers?: Json | null
      id?: string
      passed: boolean
      quiz_id: string
      score: number
      submitted_at?: string | null
      user_id: string
    }
    Update: {
      answers?: Json | null
      id?: string
      passed?: boolean
      quiz_id?: string
      score?: number
      submitted_at?: string | null
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "edu_quiz_submissions_quiz_id_fkey"
        columns: ["quiz_id"]
        isOneToOne: false
        referencedRelation: "edu_quizzes"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "edu_quiz_submissions_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_quizzes: {
    Row: {
      created_at: string | null
      exercise_id: string
      id: string
      passing_score: number
      title: string
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      exercise_id: string
      id?: string
      passing_score?: number
      title: string
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      exercise_id?: string
      id?: string
      passing_score?: number
      title?: string
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "edu_quizzes_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: true
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
    ]
  }
  exercise_review_submissions: {
    Row: {
      content: string
      created_at: string
      exercise_id: string
      id: string
      submitted_at: string
      updated_at: string
      user_id: string
      video_url: string
    }
    Insert: {
      content: string
      created_at?: string
      exercise_id: string
      id?: string
      submitted_at?: string
      updated_at?: string
      user_id: string
      video_url: string
    }
    Update: {
      content?: string
      created_at?: string
      exercise_id?: string
      id?: string
      submitted_at?: string
      updated_at?: string
      user_id?: string
      video_url?: string
    }
    Relationships: [
      {
        foreignKeyName: "exercise_review_submissions_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
    ]
  }
  sys_feedback: {
    Row: {
      content: string | null
      created_at: string | null
      feedback_type: PublicEnums["feedback_type"] | null
      id: string
      image_url: string | null
      resolved_at: string | null
      resolved_by: string | null
      status: PublicEnums["feedback_status"] | null
      user_id: string | null
    }
    Insert: {
      content?: string | null
      created_at?: string | null
      feedback_type?: PublicEnums["feedback_type"] | null
      id?: string
      image_url?: string | null
      resolved_at?: string | null
      resolved_by?: string | null
      status?: PublicEnums["feedback_status"] | null
      user_id?: string | null
    }
    Update: {
      content?: string | null
      created_at?: string | null
      feedback_type?: PublicEnums["feedback_type"] | null
      id?: string
      image_url?: string | null
      resolved_at?: string | null
      resolved_by?: string | null
      status?: PublicEnums["feedback_status"] | null
      user_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "feedback_resolved_by_fkey"
        columns: ["resolved_by"]
        isOneToOne: false
        referencedRelation: "sys_profiles"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "feedback_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  general_training_exercise_tags: {
    Row: {
      exercise_id: string
      tag_id: string
    }
    Insert: {
      exercise_id: string
      tag_id: string
    }
    Update: {
      exercise_id?: string
      tag_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "general_training_exercise_tags_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "general_training_exercises"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "general_training_exercise_tags_tag_id_fkey"
        columns: ["tag_id"]
        isOneToOne: false
        referencedRelation: "tags"
        referencedColumns: ["id"]
      },
    ]
  }
  general_training_exercises: {
    Row: {
      created_at: string
      created_by: string | null
      id: string
      order_index: number
      target_roles: string[] | null
      target_team_ids: string[] | null
      title: string
      updated_at: string
      video_url: string | null
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      id?: string
      order_index?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      title: string
      updated_at?: string
      video_url?: string | null
    }
    Update: {
      created_at?: string
      created_by?: string | null
      id?: string
      order_index?: number
      target_roles?: string[] | null
      target_team_ids?: string[] | null
      title?: string
      updated_at?: string
      video_url?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "general_training_exercises_created_by_fkey"
        columns: ["created_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  general_training_recaps: {
    Row: {
      created_at: string | null
      exercise_id: string
      id: string
      recap_content: string
      updated_at: string | null
      user_id: string
    }
    Insert: {
      created_at?: string | null
      exercise_id: string
      id?: string
      recap_content: string
      updated_at?: string | null
      user_id: string
    }
    Update: {
      created_at?: string | null
      exercise_id?: string
      id?: string
      recap_content?: string
      updated_at?: string | null
      user_id?: string
    }
    Relationships: []
  }
  imgai_generations: {
    Row: {
      created_at: string | null
      id: string
      input_image_urls: string[] | null
      output_image_url: string | null
      prompt: string | null
      user_id: string | null
      visibility: string
    }
    Insert: {
      created_at?: string | null
      id?: string
      input_image_urls?: string[] | null
      output_image_url?: string | null
      prompt?: string | null
      user_id?: string | null
      visibility?: string
    }
    Update: {
      created_at?: string | null
      id?: string
      input_image_urls?: string[] | null
      output_image_url?: string | null
      prompt?: string | null
      user_id?: string | null
      visibility?: string
    }
    Relationships: []
  }
  sys_page_views: {
    Row: {
      created_at: string
      id: string
      path: string
      user_id: string | null
    }
    Insert: {
      created_at?: string
      id?: string
      path: string
      user_id?: string | null
    }
    Update: {
      created_at?: string
      id?: string
      path?: string
      user_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "page_views_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  permissions: {
    Row: {
      created_at: string | null
      description: string | null
      id: string
      name: string
      parent_id: string | null
    }
    Insert: {
      created_at?: string | null
      description?: string | null
      id?: string
      name: string
      parent_id?: string | null
    }
    Update: {
      created_at?: string | null
      description?: string | null
      id?: string
      name?: string
      parent_id?: string | null
    }
    Relationships: []
  }
  practice_test_submissions: {
    Row: {
      created_at: string | null
      feedback: string | null
      id: string
      image_urls: string[] | null
      is_passed: boolean | null
      practice_test_id: string
      score: number | null
      status: string
      submission_text: string | null
      submitted_at: string | null
      updated_at: string | null
      user_id: string
    }
    Insert: {
      created_at?: string | null
      feedback?: string | null
      id?: string
      image_urls?: string[] | null
      is_passed?: boolean | null
      practice_test_id: string
      score?: number | null
      status?: string
      submission_text?: string | null
      submitted_at?: string | null
      updated_at?: string | null
      user_id: string
    }
    Update: {
      created_at?: string | null
      feedback?: string | null
      id?: string
      image_urls?: string[] | null
      is_passed?: boolean | null
      practice_test_id?: string
      score?: number | null
      status?: string
      submission_text?: string | null
      submitted_at?: string | null
      updated_at?: string | null
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "practice_test_submissions_practice_test_id_fkey"
        columns: ["practice_test_id"]
        isOneToOne: false
        referencedRelation: "practice_tests"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "practice_test_submissions_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
  }
  practice_tests: {
    Row: {
      content: string
      created_at: string | null
      exercise_id: string
      id: string
      is_active: boolean
      title: string
      updated_at: string | null
    }
    Insert: {
      content: string
      created_at?: string | null
      exercise_id: string
      id?: string
      is_active?: boolean
      title: string
      updated_at?: string | null
    }
    Update: {
      content?: string
      created_at?: string | null
      exercise_id?: string
      id?: string
      is_active?: boolean
      title?: string
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "practice_tests_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      },
    ]
  }
  profile_segment_roles: {
    Row: {
      created_at: string | null
      id: string
      manager_id: string | null
      profile_id: string
      role: PublicEnums["user_role"]
      segment_id: string
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      manager_id?: string | null
      profile_id: string
      role: PublicEnums["user_role"]
      segment_id: string
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      manager_id?: string | null
      profile_id?: string
      role?: PublicEnums["user_role"]
      segment_id?: string
      updated_at?: string | null
    }
    Relationships: []
  }
  sys_profiles: {
    Row: {
      created_at: string
      email: string
      full_name: string | null
      id: string
      join_date: string | null
      manager_id: string | null
      phone: string | null
      role: PublicEnums["user_role"] | null
      department_id: string | null
      updated_at: string
      work_type: PublicEnums["work_type"] | null
    }
    Insert: {
      created_at?: string
      email: string
      full_name?: string | null
      id: string
      join_date?: string | null
      manager_id?: string | null
      phone?: string | null
      role?: PublicEnums["user_role"] | null
      department_id?: string | null
      updated_at?: string
      work_type?: PublicEnums["work_type"] | null
    }
    Update: {
      created_at?: string
      email?: string
      full_name?: string | null
      id?: string
      join_date?: string | null
      manager_id?: string | null
      phone?: string | null
      role?: PublicEnums["user_role"] | null
      department_id?: string | null
      updated_at?: string
      work_type?: PublicEnums["work_type"] | null
    }
    Relationships: [
      {
        foreignKeyName: "profiles_id_fkey"
        columns: ["id"]
        isOneToOne: true
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "profiles_department_id_fkey"
        columns: ["department_id"]
        isOneToOne: false
        referencedRelation: "sys_departments"
        referencedColumns: ["id"]
      },
    ]
  }
  role_permissions: {
    Row: {
      permission_id: string
      role: PublicEnums["user_role"]
    }
    Insert: {
      permission_id: string
      role: PublicEnums["user_role"]
    }
    Update: {
      permission_id?: string
      role?: PublicEnums["user_role"]
    }
    Relationships: []
  }
  sys_roles: {
    Row: {
      created_at: string
      description: string | null
      id: string
      name: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      description?: string | null
      id?: string
      name: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      description?: string | null
      id?: string
      name?: string
      updated_at?: string
    }
    Relationships: []
  }
  segments: {
    Row: {
      created_at: string | null
      department_id: string | null
      id: string
      name: string
    }
    Insert: {
      created_at?: string | null
      department_id?: string | null
      id?: string
      name: string
    }
    Update: {
      created_at?: string | null
      department_id?: string | null
      id?: string
      name?: string
    }
    Relationships: []
  }
  shop_revenue: {
    Row: {
      created_at: string
      id: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by: string | null
    }
    Insert: {
      created_at?: string
      id?: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by?: string | null
    }
    Update: {
      created_at?: string
      id?: string
      revenue_amount?: number
      revenue_date?: string
      shop_id?: string
      uploaded_by?: string | null
    }
    Relationships: []
  }
  shopee_comprehensive_reports: {
    Row: {
      average_order_value: number | null
      breakthrough_goal: number | null
      buyer_return_rate: number | null
      cancelled_orders: number | null
      cancelled_revenue: number | null
      conversion_rate: number | null
      created_at: string
      existing_buyers: number | null
      feasible_goal: number | null
      id: string
      new_buyers: number | null
      potential_buyers: number | null
      product_clicks: number | null
      report_date: string
      returned_orders: number | null
      returned_revenue: number | null
      shop_id: string | null
      total_buyers: number | null
      total_orders: number | null
      total_revenue: number | null
      total_visits: number | null
      updated_at: string
    }
    Insert: {
      average_order_value?: number | null
      breakthrough_goal?: number | null
      buyer_return_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      created_at?: string
      existing_buyers?: number | null
      feasible_goal?: number | null
      id?: string
      new_buyers?: number | null
      potential_buyers?: number | null
      product_clicks?: number | null
      report_date: string
      returned_orders?: number | null
      returned_revenue?: number | null
      shop_id?: string | null
      total_buyers?: number | null
      total_orders?: number | null
      total_revenue?: number | null
      total_visits?: number | null
      updated_at?: string
    }
    Update: {
      average_order_value?: number | null
      breakthrough_goal?: number | null
      buyer_return_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      created_at?: string
      existing_buyers?: number | null
      feasible_goal?: number | null
      id?: string
      new_buyers?: number | null
      potential_buyers?: number | null
      product_clicks?: number | null
      report_date?: string
      returned_orders?: number | null
      returned_revenue?: number | null
      shop_id?: string | null
      total_buyers?: number | null
      total_orders?: number | null
      total_revenue?: number | null
      total_visits?: number | null
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "comprehensive_reports_shop_id_fkey"
        columns: ["shop_id"]
        isOneToOne: false
        referencedRelation: "shopee_shops"
        referencedColumns: ["id"]
      },
    ]
  }
  shopee_shop_revenue: {
    Row: {
      created_at: string | null
      id: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      revenue_amount?: number
      revenue_date?: string
      shop_id?: string
      uploaded_by?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "shop_revenue_shop_id_fkey"
        columns: ["shop_id"]
        isOneToOne: false
        referencedRelation: "shopee_shops"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "shop_revenue_uploaded_by_fkey"
        columns: ["uploaded_by"]
        isOneToOne: false
        referencedRelation: "sys_profiles"
        referencedColumns: ["id"]
      },
    ]
  }
  shopee_shops: {
    Row: {
      created_at: string | null
      id: string
      name: string
      profile_id: string | null
      status: PublicEnums["shopee_shop_status"] | null
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      name: string
      profile_id?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      name?: string
      profile_id?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      updated_at?: string | null
    }
    Relationships: []
  }
  shops: {
    Row: {
      created_at: string
      description: string | null
      id: string
      leader_id: string | null
      name: string
      updated_at: string
      user_id: string | null
    }
    Insert: {
      created_at?: string
      description?: string | null
      id?: string
      leader_id?: string | null
      name: string
      updated_at?: string
      user_id?: string | null
    }
    Update: {
      created_at?: string
      description?: string | null
      id?: string
      leader_id?: string | null
      name?: string
      updated_at?: string
      user_id?: string | null
    }
    Relationships: []
  }
  tags: {
    Row: {
      created_at: string | null
      id: string
      name: string
    }
    Insert: {
      created_at?: string | null
      id?: string
      name: string
    }
    Update: {
      created_at?: string | null
      id?: string
      name?: string
    }
    Relationships: []
  }
  thumbnail_banners: {
    Row: {
      approved_at: string | null
      approved_by: string | null
      canva_link: string | null
      created_at: string
      id: string
      image_url: string
      name: string
      status: PublicEnums["banner_status"] | null
      thumbnail_category_id: string | null
      thumbnail_type_id: string | null
      updated_at: string
      user_id: string
    }
    Insert: {
      approved_at?: string | null
      approved_by?: string | null
      canva_link?: string | null
      created_at?: string
      id?: string
      image_url: string
      name: string
      status?: PublicEnums["banner_status"] | null
      thumbnail_category_id?: string | null
      thumbnail_type_id?: string | null
      updated_at?: string
      user_id: string
    }
    Update: {
      approved_at?: string | null
      approved_by?: string | null
      canva_link?: string | null
      created_at?: string
      id?: string
      image_url?: string
      name?: string
      status?: PublicEnums["banner_status"] | null
      thumbnail_category_id?: string | null
      thumbnail_type_id?: string | null
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "banners_banner_type_id_fkey"
        columns: ["thumbnail_type_id"]
        isOneToOne: false
        referencedRelation: "thumbnail_types"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "banners_category_id_fkey"
        columns: ["thumbnail_category_id"]
        isOneToOne: false
        referencedRelation: "thumbnail_categories"
        referencedColumns: ["id"]
      },
    ]
  }
  thumbnail_categories: {
    Row: {
      created_at: string
      id: string
      name: string
    }
    Insert: {
      created_at?: string
      id?: string
      name: string
    }
    Update: {
      created_at?: string
      id?: string
      name?: string
    }
    Relationships: []
  }
  thumbnail_likes: {
    Row: {
      created_at: string
      id: string
      thumbnail_banner_id: string
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      id?: string
      thumbnail_banner_id: string
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      id?: string
      thumbnail_banner_id?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "banner_likes_banner_id_fkey"
        columns: ["thumbnail_banner_id"]
        isOneToOne: false
        referencedRelation: "thumbnail_banners"
        referencedColumns: ["id"]
      },
    ]
  }
  thumbnail_types: {
    Row: {
      created_at: string
      id: string
      name: string
    }
    Insert: {
      created_at?: string
      id?: string
      name: string
    }
    Update: {
      created_at?: string
      id?: string
      name?: string
    }
    Relationships: []
  }
  tiktok_comprehensive_reports: {
    Row: {
      breakthrough_goal: number | null
      cancelled_orders: number | null
      cancelled_revenue: number | null
      conversion_rate: number | null
      created_at: string | null
      feasible_goal: number | null
      id: string
      items_sold: number | null
      platform_subsidized_revenue: number | null
      report_date: string
      returned_revenue: number | null
      shop_id: string | null
      sku_orders: number | null
      store_visits: number | null
      total_buyers: number | null
      total_orders: number | null
      total_revenue: number | null
      total_visits: number | null
      updated_at: string | null
    }
    Insert: {
      breakthrough_goal?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      created_at?: string | null
      feasible_goal?: number | null
      id?: string
      items_sold?: number | null
      platform_subsidized_revenue?: number | null
      report_date: string
      returned_revenue?: number | null
      shop_id?: string | null
      sku_orders?: number | null
      store_visits?: number | null
      total_buyers?: number | null
      total_orders?: number | null
      total_revenue?: number | null
      total_visits?: number | null
      updated_at?: string | null
    }
    Update: {
      breakthrough_goal?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      created_at?: string | null
      feasible_goal?: number | null
      id?: string
      items_sold?: number | null
      platform_subsidized_revenue?: number | null
      report_date?: string
      returned_revenue?: number | null
      shop_id?: string | null
      sku_orders?: number | null
      store_visits?: number | null
      total_buyers?: number | null
      total_orders?: number | null
      total_revenue?: number | null
      total_visits?: number | null
      updated_at?: string | null
    }
    Relationships: []
  }
  tiktok_shop_revenue: {
    Row: {
      created_at: string | null
      id: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      revenue_amount: number
      revenue_date: string
      shop_id: string
      uploaded_by?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      revenue_amount?: number
      revenue_date?: string
      shop_id?: string
      uploaded_by?: string | null
    }
    Relationships: []
  }
  tiktok_shops: {
    Row: {
      created_at: string | null
      id: string
      name: string
      profile_id: string | null
      status: PublicEnums["tiktok_shop_status"] | null
      type: PublicEnums["tiktok_shop_type"]
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      name: string
      profile_id?: string | null
      status?: PublicEnums["tiktok_shop_status"] | null
      type?: PublicEnums["tiktok_shop_type"]
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      name?: string
      profile_id?: string | null
      status?: PublicEnums["tiktok_shop_status"] | null
      type?: PublicEnums["tiktok_shop_type"]
      updated_at?: string | null
    }
    Relationships: []
  }
  user_active_sessions: {
    Row: {
      created_at: string | null
      expires_at: string | null
      id: string
      ip_address: string | null
      is_active: boolean | null
      last_activity: string | null
      session_id: string | null
      user_agent: string | null
      user_id: string | null
    }
    Insert: {
      created_at?: string | null
      expires_at?: string | null
      id?: string
      ip_address?: string | null
      is_active?: boolean | null
      last_activity?: string | null
      session_id?: string | null
      user_agent?: string | null
      user_id?: string | null
    }
    Update: {
      created_at?: string | null
      expires_at?: string | null
      id?: string
      ip_address?: string | null
      is_active?: boolean | null
      last_activity?: string | null
      session_id?: string | null
      user_agent?: string | null
      user_id?: string | null
    }
    Relationships: []
  }
  user_course_progress: {
    Row: {
      completed_at: string | null
      completed_review_videos: number
      completed_study_sessions: number
      course_id: string
      created_at: string
      id: string
      is_completed: boolean
      started_at: string
      updated_at: string
      user_id: string
    }
    Insert: {
      completed_at?: string | null
      completed_review_videos?: number
      completed_study_sessions?: number
      course_id: string
      created_at?: string
      id?: string
      is_completed?: boolean
      started_at?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      completed_at?: string | null
      completed_review_videos?: number
      completed_study_sessions?: number
      course_id?: string
      created_at?: string
      id?: string
      is_completed?: boolean
      started_at?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  user_exercise_progress: {
    Row: {
      completed_at: string | null
      created_at: string
      exercise_id: string
      id: string
      is_completed: boolean
      quiz_passed: boolean
      recap_submitted: boolean
      session_count: number
      theory_read: boolean
      time_spent: number | null
      updated_at: string
      user_id: string
      video_completed: boolean
      video_duration: number | null
      watch_percentage: number | null
    }
    Insert: {
      completed_at?: string | null
      created_at?: string
      exercise_id: string
      id?: string
      is_completed?: boolean
      quiz_passed?: boolean
      recap_submitted?: boolean
      session_count?: number
      theory_read?: boolean
      time_spent?: number | null
      updated_at?: string
      user_id: string
      video_completed?: boolean
      video_duration?: number | null
      watch_percentage?: number | null
    }
    Update: {
      completed_at?: string | null
      created_at?: string
      exercise_id?: string
      id?: string
      is_completed?: boolean
      quiz_passed?: boolean
      recap_submitted?: boolean
      session_count?: number
      theory_read?: boolean
      time_spent?: number | null
      updated_at?: string
      user_id?: string
      video_completed?: boolean
      video_duration?: number | null
      watch_percentage?: number | null
    }
    Relationships: []
  }
  user_exercise_recaps: {
    Row: {
      created_at: string
      exercise_id: string
      id: string
      recap_content: string
      submitted_at: string
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      exercise_id: string
      id?: string
      recap_content: string
      submitted_at?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      exercise_id?: string
      id?: string
      recap_content?: string
      submitted_at?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  user_login_sessions: {
    Row: {
      browser_name: string | null
      browser_version: string | null
      city: string | null
      country: string | null
      created_at: string | null
      device_info: Json | null
      device_type: string | null
      email: string | null
      failure_reason: string | null
      id: string
      ip_address: string | null
      is_mobile: boolean | null
      location_info: Json | null
      login_method: string | null
      login_time: string | null
      logout_time: string | null
      os_name: string | null
      os_version: string | null
      session_duration: string | null
      success: boolean | null
      timezone: string | null
      user_agent: string | null
      user_id: string | null
    }
    Insert: {
      browser_name?: string | null
      browser_version?: string | null
      city?: string | null
      country?: string | null
      created_at?: string | null
      device_info?: Json | null
      device_type?: string | null
      email?: string | null
      failure_reason?: string | null
      id?: string
      ip_address?: string | null
      is_mobile?: boolean | null
      location_info?: Json | null
      login_method?: string | null
      login_time?: string | null
      logout_time?: string | null
      os_name?: string | null
      os_version?: string | null
      session_duration?: string | null
      success?: boolean | null
      timezone?: string | null
      user_agent?: string | null
      user_id?: string | null
    }
    Update: {
      browser_name?: string | null
      browser_version?: string | null
      city?: string | null
      country?: string | null
      created_at?: string | null
      device_info?: Json | null
      device_type?: string | null
      email?: string | null
      failure_reason?: string | null
      id?: string
      ip_address?: string | null
      is_mobile?: boolean | null
      location_info?: Json | null
      login_method?: string | null
      login_time?: string | null
      logout_time?: string | null
      os_name?: string | null
      os_version?: string | null
      session_duration?: string | null
      success?: boolean | null
      timezone?: string | null
      user_agent?: string | null
      user_id?: string | null
    }
    Relationships: []
  }
  user_permissions: {
    Row: {
      permission_id: string
      permission_type: PublicEnums["permission_type"]
      user_id: string
    }
    Insert: {
      permission_id: string
      permission_type: PublicEnums["permission_type"]
      user_id: string
    }
    Update: {
      permission_id?: string
      permission_type?: PublicEnums["permission_type"]
      user_id?: string
    }
    Relationships: []
  }
  user_video_progress: {
    Row: {
      course_id: string
      created_at: string
      id: string
      is_completed: boolean
      last_watched_at: string | null
      updated_at: string
      user_id: string
      video_id: string
      watch_count: number
    }
    Insert: {
      course_id: string
      created_at?: string
      id?: string
      is_completed?: boolean
      last_watched_at?: string | null
      updated_at?: string
      user_id: string
      video_id: string
      watch_count?: number
    }
    Update: {
      course_id?: string
      created_at?: string
      id?: string
      is_completed?: boolean
      last_watched_at?: string | null
      updated_at?: string
      user_id?: string
      video_id?: string
      watch_count?: number
    }
    Relationships: []
  }
  video_tracking: {
    Row: {
      created_at: string
      exercise_id: string
      id: string
      last_position: number
      session_count: number
      total_watch_time: number
      updated_at: string
      user_id: string
      video_duration: number
      watch_percentage: number
    }
    Insert: {
      created_at?: string
      exercise_id: string
      id?: string
      last_position?: number
      session_count?: number
      total_watch_time?: number
      updated_at?: string
      user_id: string
      video_duration?: number
      watch_percentage?: number
    }
    Update: {
      created_at?: string
      exercise_id?: string
      id?: string
      last_position?: number
      session_count?: number
      total_watch_time?: number
      updated_at?: string
      user_id?: string
      video_duration?: number
      watch_percentage?: number
    }
    Relationships: []
  }
}