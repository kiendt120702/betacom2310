export type EduQuizAnswers = {
  Row: {
    content: string
    created_at: string | null
    id: string
    is_correct: boolean
    order_index: number | null
    question_id: string
    updated_at: string | null
  }
  Insert: {
    content: string
    created_at?: string | null
    id?: string
    is_correct?: boolean
    order_index?: number | null
    question_id: string
    updated_at?: string | null
  }
  Update: {
    content?: string
    created_at?: string | null
    id?: string
    is_correct?: boolean
    order_index?: number | null
    question_id?: string
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "edu_quiz_answers_question_id_fkey"
      columns: ["question_id"]
      isOneToOne: false
      referencedRelation: "edu_quiz_questions"
      referencedColumns: ["id"]
    },
  ]
}