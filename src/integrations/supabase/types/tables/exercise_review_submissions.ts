export type ExerciseReviewSubmissions = {
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