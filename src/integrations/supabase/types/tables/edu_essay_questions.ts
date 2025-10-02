export type EduEssayQuestions = {
  Row: {
    content: string
    created_at: string
    exercise_id: string
    id: string
    updated_at: string
  }
  Insert: {
    content: string
    created_at?: string
    exercise_id: string
    id?: string
    updated_at?: string
  }
  Update: {
    content?: string
    created_at?: string
    exercise_id?: string
    id?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "edu_essay_questions_exercise_id_fkey"
      columns: ["exercise_id"]
      isOneToOne: false
      referencedRelation: "edu_knowledge_exercises"
      referencedColumns: ["id"]
    },
  ]
}