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
      banner_likes: {
        Row: {
          banner_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          banner_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          banner_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banner_likes_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      banner_types: {
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
      banners: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          banner_type_id: string | null
          canva_link: string | null
          category_id: string | null
          created_at: string
          id: string
          image_url: string
          name: string
          status: Database["public"]["Enums"]["banner_status"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          banner_type_id?: string | null
          canva_link?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          name: string
          status?: Database["public"]["Enums"]["banner_status"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          banner_type_id?: string | null
          canva_link?: string | null
          category_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          status?: Database["public"]["Enums"]["banner_status"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_banner_type_id_fkey"
            columns: ["banner_type_id"]
            isOneToOne: false
            referencedRelation: "banner_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "banners_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
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
      comprehensive_reports: {
        Row: {
          average_order_value: number | null
          buyer_return_rate: number | null
          cancelled_orders: number | null
          cancelled_revenue: number | null
          conversion_rate: number | null
          created_at: string
          existing_buyers: number | null
          id: string
          new_buyers: number | null
          potential_buyers: number | null
          product_clicks: number | null
          report_date: string
          returned_orders: number | null
          returned_revenue: number | null
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
          id?: string
          new_buyers?: number | null
          potential_buyers?: number | null
          product_clicks?: number | null
          report_date: string
          returned_orders?: number | null
          returned_revenue?: number | null
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
          created_at?: string
          existing_buyers?: number | null
          id?: string
          new_buyers?: number | null
          potential_buyers?: number | null
          product_clicks?: number | null
          report_date?: string
          returned_orders?: number | null
          returned_revenue?: number | null
          total_buyers?: number | null
          total_orders?: number | null
          total_revenue?: number | null
          total_visits?: number | null
          updated_at?: string
        }
        Relationships: []
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
          current_buyers: number
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
            referencedRelation: "shops"
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
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
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
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          team_id?: string | null
          updated_at?: string
          work_type?: Database["public"]["Enums"]["work_type"] | null
        }
        Relationships: [
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
      shop_revenue: {
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
            referencedRelation: "shops"
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
      shops: {
        Row: {
          created_at: string | null
          id: string
          leader_id: string | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          leader_id?: string | null
          name?: string
          updated_at?: string | null
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
        Relationships: []
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
          recap_submitted: boolean
          time_spent: number | null
          updated_at: string
          user_id: string
          video_completed: boolean
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          recap_submitted?: boolean
          time_spent?: number | null
          updated_at?: string
          user_id: string
          video_completed?: boolean
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          id?: string
          is_completed?: boolean
          notes?: string | null
          recap_submitted?: boolean
          time_spent?: number | null
          updated_at?: string
          user_id?: string
          video_completed?: boolean
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      get_cached_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_chat_statistics: {
        Args: { end_date_param: string; start_date_param: string }
        Returns: {
          total_general_messages: number
          total_messages: number
          total_seo_messages: number
          total_strategy_messages: number
          total_users: number
        }[]
      }
      get_daily_chat_usage: {
        Args: { end_date_param: string; start_date_param: string }
        Returns: {
          date: string
          message_count: number
        }[]
      }
      get_top_bots_by_messages: {
        Args: {
          end_date_param: string
          limit_param?: number
          start_date_param: string
        }
        Returns: {
          bot_type: string
          message_count: number
        }[]
      }
      get_top_users_by_messages: {
        Args: {
          end_date_param: string
          limit_param?: number
          start_date_param: string
        }
        Returns: {
          message_count: number
          user_id: string
          user_name: string
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
        Returns: string
      }
      search_banners: {
        Args:
          | {
              category_filter?: string
              page_num?: number
              page_size?: number
              search_term?: string
              sort_by?: string
              status_filter?: string
              type_filter?: string
            }
          | {
              category_filter?: string
              page_num?: number
              page_size?: number
              search_term?: string
              status_filter?: string
              type_filter?: string
            }
          | {
              category_filter?: string
              page_num?: number
              page_size?: number
              search_term?: string
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
      search_seo_knowledge: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
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
      user_role:
        | "admin"
        | "leader"
        | "chuyên viên"
        | "học việc/thử việc"
        | "deleted"
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
      user_role: [
        "admin",
        "leader",
        "chuyên viên",
        "học việc/thử việc",
        "deleted",
      ],
      work_type: ["fulltime", "parttime"],
    },
  },
} as const
