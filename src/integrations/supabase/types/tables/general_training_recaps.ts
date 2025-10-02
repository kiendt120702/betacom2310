export type GeneralTrainingRecaps = {
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