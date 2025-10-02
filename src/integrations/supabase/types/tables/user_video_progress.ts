export type UserVideoProgress = {
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