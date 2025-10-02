export type PracticeTestSubmissions = {
  Row: {
    created_at: string | null
    feedback: string | null
    id: string
    image_urls: string[] | null
    is_passed: boolean | null
    practice_test_id: string
    score: number | null
    status: string
    submission_text: string | null
    submitted_at: string | null
    updated_at: string | null
    user_id: string
  }
  Insert: {
    created_at?: string | null
    feedback?: string | null
    id?: string
    image_urls?: string[] | null
    is_passed?: boolean | null
    practice_test_id: string
    score?: number | null
    status?: string
    submission_text?: string | null
    submitted_at?: string | null
    updated_at?: string | null
    user_id: string
  }
  Update: {
    created_at?: string | null
    feedback?: string | null
    id?: string
    image_urls?: string[] | null
    is_passed?: boolean | null
    practice_test_id?: string
    score?: number | null
    status?: string
    submission_text?: string | null
    submitted_at?: string | null
    updated_at?: string | null
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "practice_test_submissions_practice_test_id_fkey"
      columns: ["practice_test_id"]
      isOneToOne: false
      referencedRelation: "practice_tests"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "practice_test_submissions_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}