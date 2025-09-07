import type { Json } from "./database"
import type { PublicEnums } from "./schema-public-enums"

export type PublicTables = {
  assignment_submissions: {
    Row: {
      assignment_id: string
      content: string | null
      created_at: string
      feedback: string | null
      file_url: string | null
      id: string
      reviewed_at: string | null
      reviewed_by: string | null
      status: string
      submitted_at: string
      updated_at: string
      user_id: string
    }
    Insert: {
      assignment_id: string
      content?: string | null
      created_at?: string
      feedback?: string | null
      file_url?: string | null
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: string
      submitted_at?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      assignment_id?: string
      content?: string | null
      created_at?: string
      feedback?: string | null
      file_url?: string | null
      id?: string
      reviewed_at?: string | null
      reviewed_by?: string | null
      status?: string
      submitted_at?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: [
      {
        foreignKeyName: "assignment_submissions_assignment_id_fkey"
        columns: ["assignment_id"]
        isOneToOne: false
        referencedRelation: "assignments"
        referencedColumns: ["id"]
      },
    ]
  }
  assignments: {
    Row: {
      course_id: string
      created_at: string
      created_by: string | null
      description: string | null
      due_date: string | null
      id: string
      instructions: string | null
      title: string
      updated_at: string
    }
    Insert: {
      course_id: string
      created_at?: string
      created_by?: string | null
      description?: string | null
      due_date?: string | null
      id?: string
      instructions?: string | null
      title: string
      updated_at?: string
    }
    Update: {
      course_id?: string
      created_at?: string
      created_by?: string | null
      description?: string | null
      due_date?: string | null
      id?: string
      instructions?: string | null
      title?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "assignments_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
    ]
  }
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
  thumbnail_likes: {
    Row: {
      thumbnail_banner_id: string
      created_at: string
      id: string
      updated_at: string
      user_id: string
    }
    Insert: {
      thumbnail_banner_id: string
      created_at?: string
      id?: string
      updated_at?: string
      user_id: string
    }
    Update: {
      thumbnail_banner_id?: string
      created_at?: string
      id?: string
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
  thumbnail_banners: {
    Row: {
      approved_at: string | null
      approved_by: string | null
      thumbnail_type_id: string | null
      canva_link: string | null
      thumbnail_category_id: string | null
      created_at: string
      id: string
      image_url: string
      name: string
      status: PublicEnums["banner_status"] | null
      updated_at: string
      user_id: string
    }
    Insert: {
      approved_at?: string | null
      approved_by?: string | null
      thumbnail_type_id?: string | null
      canva_link?: string | null
      thumbnail_category_id?: string | null
      created_at?: string
      id?: string
      image_url: string
      name: string
      status?: PublicEnums["banner_status"] | null
      updated_at?: string
      user_id: string
    }
    Update: {
      approved_at?: string | null
      approved_by?: string | null
      thumbnail_type_id?: string | null
      canva_link?: string | null
      thumbnail_category_id?: string | null
      created_at?: string
      id?: string
      image_url?: string
      name?: string
      status?: PublicEnums["banner_status"] | null
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
  shopee_comprehensive_reports: {
    Row: {
      average_order_value: number | null
      buyer_return_rate: number | null
      cancelled_orders: number | null
      cancelled_revenue: number | null
      conversion_rate: number | null
      created_at: string
      existing_buyers: number | null
      feasible_goal: number | null
      breakthrough_goal: number | null
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
      buyer_return_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      created_at?: string
      existing_buyers?: number | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
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
      buyer_return_rate?: number | null
      cancelled_orders?: number | null
      cancelled_revenue?: number | null
      conversion_rate?: number | null
      existing_buyers?: number | null
      feasible_goal?: number | null
      breakthrough_goal?: number | null
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
  daily_shop_metrics: {
    Row: {
      buyer_return_rate: number
      cancelled_orders: number
      cancelled_sales_vnd: number
      conversion_rate: number
      created_at: string | null
      current_buyers: number
      id: string
      metric_date: string
      new_buyers: number
      potential_buyers: number
      product_clicks: number
      returned_refunded_orders: number
      returned_refunded_sales_vnd: number
      sales_per_order: number
      shop_id: string
      total_buyers: number
      total_orders: number
      total_sales_vnd: number
      total_visits: number
      updated_at: string | null
      uploaded_by: string | null
    }
    Insert: {
      buyer_return_rate: number
      cancelled_orders: number
      cancelled_sales_vnd: number
      conversion_rate: number
      created_at?: string | null
      id?: string
      metric_date: string
      new_buyers: number
      potential_buyers: number
      product_clicks: number
      returned_refunded_orders: number
      returned_refunded_sales_vnd: number
      sales_per_order: number
      shop_id: string
      total_buyers: number
      total_orders: number
      total_sales_vnd: number
      total_visits: number
      updated_at?: string | null
      uploaded_by?: string | null
    }
    Update: {
      buyer_return_rate?: number
      cancelled_orders?: number
      cancelled_sales_vnd?: number
      conversion_rate?: number
      created_at?: string | null
      current_buyers?: number
      id?: string
      metric_date?: string
      new_buyers?: number
      potential_buyers?: number
      product_clicks?: number
      returned_refunded_orders?: number
      returned_refunded_sales_vnd?: number
      sales_per_order?: number
      shop_id?: string
      total_buyers?: number
      total_orders?: number
      total_sales_vnd?: number
      total_visits?: number
      updated_at?: string | null
      uploaded_by?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "daily_shop_metrics_shop_id_fkey"
        columns: ["shop_id"]
        isOneToOne: false
        referencedRelation: "shopee_shops"
        referencedColumns: ["id"]
      },
    ]
  }
  edu_essay_submissions: {
    Row: {
      answers: Json | null
      created_at: string
      exercise_id: string
      id: string
      started_at: string | null
      submitted_at: string | null
      time_limit_minutes: number | null
      updated_at: string
      user_id: string
    }
    Insert: {
      answers?: Json | null
      created_at?: string
      exercise_id: string
      id?: string
      started_at?: string | null
      submitted_at?: string | null
      time_limit_minutes?: number | null
      updated_at?: string
      user_id: string
    }
    Update: {
      answers?: Json | null
      created_at?: string
      exercise_id?: string
      id?: string
      started_at?: string | null
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
      content: string | null
      created_at: string
      created_by: string
      description: string | null
      exercise_video_url: string | null
      id: string
      is_required: boolean
      min_completion_time: number | null
      min_review_videos: number
      min_study_sessions: number
      order_index: number
      required_review_videos: number
      title: string
      updated_at: string
    }
    Insert: {
      content?: string | null
      created_at?: string
      created_by: string
      description?: string | null
      exercise_video_url?: string | null
      id?: string
      is_required?: boolean
      min_completion_time?: number | null
      min_review_videos?: number
      min_study_sessions?: number
      order_index?: number
      required_review_videos?: number
      title: string
      updated_at?: string
    }
    Update: {
      content?: string | null
      created_at?: string
      created_by?: string
      description?: string | null
      exercise_video_url?: string | null
      id?: string
      is_required?: boolean
      min_completion_time?: number | null
      min_review_videos?: number
      min_study_sessions?: number
      order_index?: number
      required_review_videos?: number
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
  edu_essay_questions: {
    Row: {
      id: string
      exercise_id: string
      content: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      exercise_id: string
      content: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      exercise_id?: string
      content?: string
      created_at?: string
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
  feedback: {
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
        referencedRelation: "profiles"
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
  general_training_exercises: {
    Row: {
      id: string
      title: string
      video_url: string | null
      order_index: number
      created_by: string | null
      created_at: string
      updated_at: string
      target_roles: string[] | null
      target_team_ids: string[] | null
    }
    Insert: {
      id?: string
      title: string
      video_url?: string | null
      order_index?: number
      created_by?: string | null
      created_at?: string
      updated_at?: string
      target_roles?: string[] | null
      target_team_ids?: string[] | null
    }
    Update: {
      id?: string
      title?: string
      video_url?: string | null
      order_index?: number
      created_by?: string | null
      created_at?: string
      updated_at?: string
      target_roles?: string[] | null
      target_team_ids?: string[] | null
    }
    Relationships: [
      {
        foreignKeyName: "general_training_exercises_created_by_fkey"
        columns: ["created_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
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
      }
    ]
  }
  general_training_recaps: {
    Row: {
      id: string
      user_id: string
      exercise_id: string
      recap_content: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      exercise_id: string
      recap_content: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      exercise_id?: string
      recap_content?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "general_training_recaps_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "general_training_recaps_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "general_training_exercises"
        referencedColumns: ["id"]
      }
    ]
  }
  gpt4o_mini_conversations: {
    Row: {
      created_at: string | null
      id: string
      title: string
      user_id: string
    }
    Insert: {
      created_at?: string | null
      id?: string
      title: string
      user_id: string
    }
    Update: {
      created_at?: string | null
      id?: string
      title?: string
      user_id?: string
    }
    Relationships: []
  }
  gpt4o_mini_messages: {
    Row: {
      content: string
      conversation_id: string
      created_at: string | null
      id: string
      role: string
    }
    Insert: {
      content: string
      conversation_id: string
      created_at?: string | null
      id?: string
      role: string
    }
    Update: {
      content?: string
      conversation_id?: string
      created_at?: string | null
      id?: string
      role?: string
    }
    Relationships: [
      {
        foreignKeyName: "gpt5_mini_messages_conversation_id_fkey"
        columns: ["conversation_id"]
        isOneToOne: false
        referencedRelation: "gpt4o_mini_conversations"
        referencedColumns: ["id"]
      },
    ]
  }
  leader_training_exercises: {
    Row: {
      id: string
      title: string
      description: string | null
      content: string | null
      video_url: string | null
      order_index: number
      is_required: boolean
      min_review_videos: number | null
      created_by: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      title: string
      description?: string | null
      content?: string | null
      video_url?: string | null
      order_index?: number
      is_required?: boolean
      min_review_videos?: number | null
      created_by?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      title?: string
      description?: string | null
      content?: string | null
      video_url?: string | null
      order_index?: number
      is_required?: boolean
      min_review_videos?: number | null
      created_by?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "leader_training_exercises_created_by_fkey"
        columns: ["created_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
    ]
  }
  page_views: {
    Row: {
      id: string
      created_at: string
      path: string
      user_id: string | null
    }
    Insert: {
      id?: string
      created_at?: string
      path: string
      user_id?: string | null
    }
    Update: {
      id?: string
      created_at?: string
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
      }
    ]
  }
  practice_tests: {
    Row: {
      id: string
      exercise_id: string
      title: string
      content: string
      is_active: boolean
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      exercise_id: string
      title: string
      content: string
      is_active?: boolean
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      exercise_id?: string
      title?: string
      content?: string
      is_active?: boolean
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "practice_tests_exercise_id_fkey"
        columns: ["exercise_id"]
        isOneToOne: false
        referencedRelation: "edu_knowledge_exercises"
        referencedColumns: ["id"]
      }
    ]
  }
  practice_test_submissions: {
    Row: {
      id: string
      user_id: string
      practice_test_id: string
      submitted_at: string
      image_urls: string[]
      feedback: string | null
      score: number | null
      status: string
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      user_id: string
      practice_test_id: string
      submitted_at?: string
      image_urls: string[]
      feedback?: string | null
      score?: number | null
      status?: string
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      practice_test_id?: string
      submitted_at?: string
      image_urls?: string[]
      feedback?: string | null
      score?: number | null
      status?: string
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "practice_test_submissions_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "practice_test_submissions_practice_test_id_fkey"
        columns: ["practice_test_id"]
        isOneToOne: false
        referencedRelation: "practice_tests"
        referencedColumns: ["id"]
      }
    ]
  }
  profiles: {
    Row: {
      created_at: string
      email: string
      full_name: string | null
      id: string
      join_date: string | null
      phone: string | null
      role: PublicEnums["user_role"] | null
      team_id: string | null
      updated_at: string
      work_type: PublicEnums["work_type"] | null
    }
    Insert: {
      created_at?: string
      email: string
      full_name?: string | null
      id: string
      join_date?: string | null
      phone?: string | null
      role?: PublicEnums["user_role"] | null
      team_id?: string | null
      updated_at?: string
      work_type?: PublicEnums["work_type"] | null
    }
    Update: {
      created_at?: string
      email?: string
      full_name?: string | null
      id?: string
      join_date?: string | null
      phone?: string | null
      role?: PublicEnums["user_role"] | null
      team_id?: string | null
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
        foreignKeyName: "profiles_team_id_fkey"
        columns: ["team_id"]
        isOneToOne: false
        referencedRelation: "teams"
        referencedColumns: ["id"]
      },
    ]
  }
  roles: {
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
  seo_chat_conversations: {
    Row: {
      created_at: string
      id: string
      title: string | null
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      id?: string
      title?: string | null
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      id?: string
      title?: string | null
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  seo_chat_messages: {
    Row: {
      content: string
      conversation_id: string
      created_at: string
      id: string
      metadata: Json | null
      role: string
    }
    Insert: {
      content: string
      conversation_id: string
      created_at?: string
      id?: string
      metadata?: Json | null
      role: string
    }
    Update: {
      content?: string
      conversation_id?: string
      created_at?: string
      id?: string
      metadata?: Json | null
      role?: string
    }
    Relationships: [
      {
        foreignKeyName: "seo_chat_messages_conversation_id_fkey"
        columns: ["conversation_id"]
        isOneToOne: false
        referencedRelation: "seo_chat_conversations"
        referencedColumns: ["id"]
      },
    ]
  }
  seo_knowledge: {
    Row: {
      content: string
      content_embedding: string | null
      created_at: string
      id: string
      updated_at: string
    }
    Insert: {
      content: string
      content_embedding?: string | null
      created_at?: string
      id?: string
      updated_at?: string
    }
    Update: {
      content?: string
      content_embedding?: string | null
      created_at?: string
      id?: string
      updated_at?: string
    }
    Relationships: []
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
        referencedRelation: "profiles"
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
      team_id: string | null
      updated_at: string | null
    }
    Insert: {
      created_at?: string | null
      id?: string
      name: string
      profile_id?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      team_id?: string | null
      updated_at?: string | null
    }
    Update: {
      created_at?: string | null
      id?: string
      name?: string
      profile_id?: string | null
      status?: PublicEnums["shopee_shop_status"] | null
      team_id?: string | null
      updated_at?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "shops_team_id_fkey"
        columns: ["team_id"]
        isOneToOne: false
        referencedRelation: "teams"
        referencedColumns: ["id"]
      },
    ]
  }
  specialist_training_exercises: {
    Row: {
      id: string
      title: string
      description: string | null
      content: string | null
      video_url: string | null
      order_index: number
      is_required: boolean
      min_review_videos: number | null
      created_by: string | null
      created_at: string
      updated_at: string
    }
    Insert: {
      id?: string
      title: string
      description?: string | null
      content?: string | null
      video_url?: string | null
      order_index?: number
      is_required?: boolean
      min_review_videos?: number | null
      created_by?: string | null
      created_at?: string
      updated_at?: string
    }
    Update: {
      id?: string
      title?: string
      description?: string | null
      content?: string | null
      video_url?: string | null
      order_index?: number
      is_required?: boolean
      min_review_videos?: number | null
      created_by?: string | null
      created_at?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "specialist_training_exercises_created_by_fkey"
        columns: ["created_by"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      }
    ]
  }
  strategies: {
    Row: {
      created_at: string
      id: string
      implementation: string
      strategy: string
      updated_at: string
      user_id: string
    }
    Insert: {
      created_at?: string
      id?: string
      implementation: string
      strategy: string
      updated_at?: string
      user_id: string
    }
    Update: {
      created_at?: string
      id?: string
      implementation?: string
      strategy?: string
      updated_at?: string
      user_id?: string
    }
    Relationships: []
  }
  teams: {
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
  training_courses: {
    Row: {
      created_at: string
      created_by: string | null
      description: string | null
      id: string
      min_review_videos: number
      min_study_sessions: number
      title: string
      updated_at: string
    }
    Insert: {
      created_at?: string
      created_by?: string | null
      description?: string | null
      id?: string
      min_review_videos?: number
      min_study_sessions?: number
      title: string
      updated_at?: string
    }
    Update: {
      created_at?: string
      created_by?: string | null
      description?: string | null
      id?: string
      min_review_videos?: number
      min_study_sessions?: number
      title?: string
      updated_at?: string
    }
    Relationships: [
      {
        foreignKeyName: "training_courses_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
    ]
  }
  training_videos: {
    Row: {
      course_id: string
      created_at: string
      created_by: string | null
      duration: number | null
      id: string
      is_review_video: boolean
      order_index: number
      title: string
      updated_at: string
      video_url: string
    }
    Insert: {
      course_id: string
      created_at?: string
      created_by?: string | null
      duration?: number | null
      id?: string
      is_review_video?: boolean
      order_index?: number
      title: string
      updated_at?: string
      video_url: string
    }
    Update: {
      course_id?: string
      created_at?: string
      created_by?: string | null
      duration?: number | null
      id?: string
      is_review_video?: boolean
      order_index?: number
      title?: string
      updated_at?: string
      video_url?: string
    }
    Relationships: [
      {
        foreignKeyName: "training_videos_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
    ]
  }
  upload_history: {
    Row: {
      created_at: string
      details: Json | null
      file_name: string
      file_type: string
      id: string
      status: string
      user_id: string | null
    }
    Insert: {
      created_at?: string
      details?: Json | null
      file_name: string
      file_type: string
      id?: string
      status: string
      user_id?: string | null
    }
    Update: {
      created_at?: string
      details?: Json | null
      file_name?: string
      file_type?: string
      id?: string
      status?: string
      user_id?: string | null
    }
    Relationships: [
      {
        foreignKeyName: "upload_history_user_id_fkey"
        columns: ["user_id"]
        isOneToOne: false
        referencedRelation: "users"
        referencedColumns: ["id"]
      },
    ]
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
    Relationships: [
      {
        foreignKeyName: "user_course_progress_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
    ]
  }
  user_exercise_progress: {
    Row: {
      completed_at: string | null
      created_at: string
      exercise_id: string
      id: string
      is_completed: boolean
      notes: string | null
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
      notes?: string | null
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
      notes?: string | null
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
  user_video_progress: {
    Row: {
      course_id: string
      created_at: string
      id: string
      is_completed: boolean
      last_watched_at: string | null
      time_spent: number | null
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
      time_spent?: number | null
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
      time_spent?: number | null
      updated_at?: string
      user_id?: string
      video_id?: string
      watch_count?: number
    }
    Relationships: [
      {
        foreignKeyName: "user_video_progress_course_id_fkey"
        columns: ["course_id"]
        isOneToOne: false
        referencedRelation: "training_courses"
        referencedColumns: ["id"]
      },
      {
        foreignKeyName: "user_video_progress_video_id_fkey"
        columns: ["video_id"]
        isOneToOne: false
        referencedRelation: "training_videos"
        referencedColumns: ["id"]
      },
    ]
  }
  tags: {
    Row: {
      id: string
      name: string
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      created_at?: string
    }
    Relationships: []
  }
}