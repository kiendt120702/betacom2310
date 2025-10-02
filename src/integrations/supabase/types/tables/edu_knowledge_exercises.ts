import type { Json } from "../database"

export type EduKnowledgeExercises = {
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