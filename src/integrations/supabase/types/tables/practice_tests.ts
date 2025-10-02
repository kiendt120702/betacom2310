export type PracticeTests = {
  Row: {
    content: string
    created_at: string | null
    exercise_id: string
    id: string
    is_active: boolean
    title: string
    updated_at: string | null
  }
  Insert: {
    content: string
    created_at?: string | null
    exercise_id: string
    id?: string
    is_active?: boolean
    title: string
    updated_at?: string | null
  }
  Update: {
    content?: string
    created_at?: string | null
    exercise_id?: string
    id?: string
    is_active?: boolean
    title?: string
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "practice_tests_exercise_id_fkey"
      columns: ["exercise_id"]
      isOneToOne: false
      referencedRelation: "edu_knowledge_exercises"
      referencedColumns: ["id"]
    },
  ]
}