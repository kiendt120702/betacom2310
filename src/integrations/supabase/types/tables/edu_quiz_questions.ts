import type { PublicEnums } from "../schema-public-enums"

export type EduQuizQuestions = {
  Row: {
    content: string
    created_at: string | null
    id: string
    order_index: number | null
    question_type: PublicEnums["question_type"]
    quiz_id: string
    updated_at: string | null
  }
  Insert: {
    content: string
    created_at?: string | null
    id?: string
    order_index?: number | null
    question_type?: PublicEnums["question_type"]
    quiz_id: string
    updated_at?: string | null
  }
  Update: {
    content?: string
    created_at?: string | null
    id?: string
    order_index?: number | null
    question_type?: PublicEnums["question_type"]
    quiz_id?: string
    updated_at?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "edu_quiz_questions_quiz_id_fkey"
      columns: ["quiz_id"]
      isOneToOne: false
      referencedRelation: "edu_quizzes"
      referencedColumns: ["id"]
    },
  ]
}