import type { Json } from "../database"

export type EduEssaySubmissions = {
  Row: {
    answers: Json | null
    created_at: string
    exercise_id: string
    grader_feedback: string | null
    id: string
    score: number | null
    started_at: string | null
    status: string | null
    submitted_at: string | null
    time_limit_minutes: number | null
    updated_at: string
    user_id: string
  }
  Insert: {
    answers?: Json | null
    created_at?: string
    exercise_id: string
    grader_feedback?: string | null
    id?: string
    score?: number | null
    started_at?: string | null
    status?: string | null
    submitted_at?: string | null
    time_limit_minutes?: number | null
    updated_at?: string
    user_id: string
  }
  Update: {
    answers?: Json | null
    created_at?: string
    exercise_id?: string
    grader_feedback?: string | null
    id?: string
    score?: number | null
    started_at?: string | null
    status?: string | null
    submitted_at?: string | null
    time_limit_minutes?: number | null
    updated_at?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "edu_essay_submissions_exercise_id_fkey"
      columns: ["exercise_id"]
      isOneToOne: false
      referencedRelation: "edu_knowledge_exercises"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "edu_essay_submissions_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}