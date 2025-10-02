export type UserExerciseRecaps = {
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