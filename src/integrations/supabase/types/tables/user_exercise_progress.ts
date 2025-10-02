export type UserExerciseProgress = {
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