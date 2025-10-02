import type { Json } from "../database"

export type CheckpointAttempts = {
  Row: {
    id: string
    user_id: string
    exercise_id: string
    answers: Json | null
    submitted_at: string
    created_at: string
  }
  Insert: {
    id?: string
    user_id: string
    exercise_id: string
    answers?: Json | null
    submitted_at?: string
    created_at?: string
  }
  Update: {
    id?: string
    user_id?: string
    exercise_id?: string
    answers?: Json | null
    submitted_at?: string
    created_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "checkpoint_attempts_exercise_id_fkey"
      columns: ["exercise_id"]
      isOneToOne: false
      referencedRelation: "edu_knowledge_exercises"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "checkpoint_attempts_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}