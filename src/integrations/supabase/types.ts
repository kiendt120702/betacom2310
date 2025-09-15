export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
          created_by: string
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
          created_by: string
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
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      beatcomai_chatgpt: {
        Row: {
          created_at: string | null
          id: string
          messages: Json
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          messages: Json
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          messages?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      comprehensive_reports: {
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
            foreignKeyName: "comprehensive_reports_shop_id_fkey1"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          },
        ]
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
        ]
      }
      edu_knowledge_exercises: {
        Row: {
          created_at: string
          created_by: string
          documents: Json | null
          exercise_video_url: string | null
          id: string
          is_required: boolean
          min_completion_time: number | null
          min_review_videos: number
          min_study_sessions: number
          order_index: number
          required_review_videos: number
          required_viewing_count: number
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          target_team_ids: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          documents?: Json | null
          exercise_video_url?: string | null
          id?: string
          is_required?: boolean
          min_completion_time?: number | null
          min_review_videos?: number
          min_study_sessions?: number
          order_index?: number
          required_review_videos?: number
          required_viewing_count?: number
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          target_team_ids?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          documents?: Json | null
          exercise_video_url?: string | null
          id?: string
          is_required?: boolean
          min_completion_time?: number | null
          min_review_videos?: number
          min_study_sessions?: number
          order_index?: number
          required_review_videos?: number
          required_viewing_count?: number
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
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
          question_type: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          question_type?: Database["public"]["Enums"]["question_type"]
          quiz_id: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          order_index?: number | null
          question_type?: Database["public"]["Enums"]["question_type"]
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
          feedback_type: Database["public"]["Enums"]["feedback_type"] | null
          id: string
          image_url: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["feedback_status"] | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"] | null
          id?: string
          image_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"] | null
          id?: string
          image_url?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["feedback_status"] | null
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
          target_roles: Database["public"]["Enums"]["user_role"][] | null
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
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
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
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          target_team_ids?: string[] | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "general_training_recaps_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "general_training_exercises"
            referencedColumns: ["id"]
          },
        ]
      }

      page_views: {
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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "permissions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_test_submissions: {
        Row: {
          created_at: string | null
          feedback: string | null
          id: string
          image_urls: string[]
          is_passed: boolean | null
          practice_test_id: string
          score: number | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          image_urls: string[]
          is_passed?: boolean | null
          practice_test_id: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          feedback?: string | null
          id?: string
          image_urls?: string[]
          is_passed?: boolean | null
          practice_test_id?: string
          score?: number | null
          status?: string
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
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          join_date: string | null
          manager_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          team_id: string | null
          updated_at: string
          work_type: Database["public"]["Enums"]["work_type"] | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          join_date?: string | null
          manager_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"] | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          join_date?: string | null
          manager_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      role_permissions: {
        Row: {
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
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
          revenue_amount?: number
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
          status: Database["public"]["Enums"]["shopee_shop_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["shopee_shop_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["shopee_shop_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shops_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "shops_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shops_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      thumbnail_banners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          canva_link: string | null
          created_at: string
          id: string
          image_url: string
          name: string
          status: Database["public"]["Enums"]["banner_status"] | null
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
          status?: Database["public"]["Enums"]["banner_status"] | null
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
          status?: Database["public"]["Enums"]["banner_status"] | null
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
        Relationships: [
          {
            foreignKeyName: "tiktok_comprehensive_reports_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "tiktok_shops"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "tiktok_shop_revenue_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "tiktok_shops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tiktok_shop_revenue_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tiktok_shops: {
        Row: {
          created_at: string | null
          id: string
          name: string
          profile_id: string | null
          status: Database["public"]["Enums"]["tiktok_shop_status"] | null
          type: Database["public"]["Enums"]["tiktok_shop_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["tiktok_shop_status"] | null
          type?: Database["public"]["Enums"]["tiktok_shop_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          profile_id?: string | null
          status?: Database["public"]["Enums"]["tiktok_shop_status"] | null
          type?: Database["public"]["Enums"]["tiktok_shop_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_shops_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_active_sessions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          is_active?: boolean | null
          last_activity?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_active_sessions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_login_sessions"
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
          ip_address: unknown | null
          is_mobile: boolean | null
          location_info: Json | null
          login_method: string | null
          login_time: string | null
          logout_time: string | null
          os_name: string | null
          os_version: string | null
          session_duration: unknown | null
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
          ip_address?: unknown | null
          is_mobile?: boolean | null
          location_info?: Json | null
          login_method?: string | null
          login_time?: string | null
          logout_time?: string | null
          os_name?: string | null
          os_version?: string | null
          session_duration?: unknown | null
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
          ip_address?: unknown | null
          is_mobile?: boolean | null
          location_info?: Json | null
          login_method?: string | null
          login_time?: string | null
          logout_time?: string | null
          os_name?: string | null
          os_version?: string | null
          session_duration?: unknown | null
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
          permission_type: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Insert: {
          permission_id: string
          permission_type: Database["public"]["Enums"]["permission_type"]
          user_id: string
        }
        Update: {
          permission_id?: string
          permission_type?: Database["public"]["Enums"]["permission_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "video_tracking_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "edu_knowledge_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      calculate_engagement_score: {
        Args: { p_exercise_id: string }
        Returns: number
      }
      check_permission: {
        Args: { p_permission_name: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_active_sessions: {
        Args: { p_user_id?: string }
        Returns: {
          browser_name: string
          device_type: string
          email: string
          ip_address: unknown
          is_current: boolean
          last_activity: string
          login_time: string
          os_name: string
          session_id: string
          user_id: string
        }[]
      }
      get_all_reports_for_dashboard: {
        Args: { month_text: string }
        Returns: Json
      }
      get_all_shops_for_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_avg_watch_time: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_cached_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_daily_page_views: {
        Args: { end_date_param: string; start_date_param: string }
        Returns: {
          date: string
          view_count: number
        }[]
      }
      get_exercise_video_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_completion_rate: number
          avg_rewatch_count: number
          avg_watch_time: number
          exercise_id: string
          exercise_title: string
          total_sessions: number
          total_viewers: number
        }[]
      }
      get_public_generations: {
        Args: { page_num?: number; page_size?: number }
        Returns: {
          created_at: string
          id: string
          input_image_urls: string[]
          output_image_url: string
          prompt: string
          user_email: string
          user_full_name: string
          user_id: string
        }[]
      }
      get_top_pages: {
        Args: {
          end_date_param: string
          limit_param?: number
          start_date_param: string
        }
        Returns: {
          path: string
          view_count: number
        }[]
      }
      get_top_users_by_page_views: {
        Args: {
          end_date_param: string
          page_num?: number
          page_size?: number
          start_date_param: string
        }
        Returns: {
          total_count: number
          user_id: string
          user_name: string
          view_count: number
        }[]
      }
      get_total_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_email: {
        Args: { p_feedback: Database["public"]["Tables"]["feedback"]["Row"] }
        Returns: string
      }
      get_user_login_history: {
        Args: { p_limit?: number; p_offset?: number; p_user_id?: string }
        Returns: {
          browser_name: string
          browser_version: string
          device_type: string
          email: string
          failure_reason: string
          id: string
          ip_address: unknown
          is_mobile: boolean
          location_info: Json
          login_time: string
          logout_time: string
          os_name: string
          session_duration: unknown
          success: boolean
          user_id: string
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_team_id: {
        Args: { user_id: string }
        Returns: string
      }
      get_user_video_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_completion_rate: number
          most_watched_exercise_title: string
          total_sessions: number
          total_watch_time: number
          user_email: string
          user_id: string
          videos_watched: number
        }[]
      }
      get_video_dropout_points: {
        Args: { p_exercise_id: string }
        Returns: {
          dropout_count: number
          time_segment: number
        }[]
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_active_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      log_user_login: {
        Args: {
          p_email: string
          p_failure_reason?: string
          p_ip_address?: unknown
          p_success?: boolean
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      logout_user_session: {
        Args: { p_session_id?: string; p_user_id: string }
        Returns: undefined
      }
      parse_user_agent: {
        Args: { user_agent_string: string }
        Returns: Json
      }
      search_banners: {
        Args: {
          category_filter?: string
          page_num?: number
          page_size?: number
          search_term?: string
          sort_by?: string
          status_filter?: string
          type_filter?: string
        }
        Returns: {
          banner_type_id: string
          banner_type_name: string
          canva_link: string
          category_id: string
          category_name: string
          created_at: string
          id: string
          image_url: string
          name: string
          status: string
          total_count: number
          updated_at: string
          user_name: string
        }[]
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      start_essay_test: {
        Args: { p_exercise_id: string; p_time_limit?: number }
        Returns: Json
      }
      update_role_permissions: {
        Args: {
          p_permission_ids: string[]
          p_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: undefined
      }
      update_session_activity: {
        Args: { p_ip_address?: unknown; p_user_id: string }
        Returns: undefined
      }
      update_user_permission_overrides: {
        Args: { p_permission_overrides: Json; p_user_id: string }
        Returns: undefined
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      banner_status: "pending" | "approved" | "rejected"
      employee_role: "personnel" | "leader"
      feedback_status: "pending" | "reviewed" | "resolved"
      feedback_type: "bug" | "suggestion" | "general"
      permission_type: "grant" | "deny"
      question_type: "single_choice" | "multiple_choice"
      shopee_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
      tiktok_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
      tiktok_shop_type: "Vận hành" | "Booking"
      user_role:
        | "admin"
        | "leader"
        | "chuyên viên"
        | "học việc/thử việc"
        | "deleted"
        | "trưởng phòng"
        | "booking"
      work_type: "fulltime" | "parttime"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      banner_status: ["pending", "approved", "rejected"],
      employee_role: ["personnel", "leader"],
      feedback_status: ["pending", "reviewed", "resolved"],
      feedback_type: ["bug", "suggestion", "general"],
      permission_type: ["grant", "deny"],
      question_type: ["single_choice", "multiple_choice"],
      shopee_shop_status: ["Shop mới", "Đang Vận Hành", "Đã Dừng"],
      tiktok_shop_status: ["Shop mới", "Đang Vận Hành", "Đã Dừng"],
      tiktok_shop_type: ["Vận hành", "Booking"],
      user_role: [
        "admin",
        "leader",
        "chuyên viên",
        "học việc/thử việc",
        "deleted",
        "trưởng phòng",
        "booking",
      ],
      work_type: ["fulltime", "parttime"],
    },
  },
} as const
