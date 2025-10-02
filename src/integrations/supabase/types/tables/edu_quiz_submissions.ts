import type { Json } from "../database"

export type EduQuizSubmissions = {
  Row: {
    answers: Json | null
    id: string
    passed: boolean
    quiz_id: string
    score: number
    submitted_at: string | null
    user_id: string
  }
  Insert: {
    answers?: Json | null
    id?: string
    passed: boolean
    quiz_id: string
    score: number
    submitted_at?: string | null
    user_id: string
  }
  Update: {
    answers?: Json | null
    id?: string
    passed?: boolean
    quiz_id?: string
    score?: number
    submitted_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "edu_quiz_submissions_quiz_id_fkey"
      columns: ["quiz_id"]
      isOneToOne: false
      referencedRelation: "edu_quizzes"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "edu_quiz_submissions_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}