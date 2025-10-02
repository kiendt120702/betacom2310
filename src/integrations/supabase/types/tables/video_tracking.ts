export type VideoTracking = {
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