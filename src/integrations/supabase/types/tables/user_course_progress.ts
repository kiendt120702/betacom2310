export type UserCourseProgress = {
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