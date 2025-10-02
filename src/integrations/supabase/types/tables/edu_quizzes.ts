export type EduQuizzes = {
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