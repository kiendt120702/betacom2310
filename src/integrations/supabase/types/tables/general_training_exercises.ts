export type GeneralTrainingExercises = {
  Row: {
    created_at: string
    created_by: string | null
    id: string
    order_index: number
    target_roles: string[] | null
    target_team_ids: string[] | null
    title: string
    updated_at: string
    video_url: string | null
  }
  Insert: {
    created_at?: string
    created_by?: string | null
    id?: string
    order_index?: number
    target_roles?: string[] | null
    target_team_ids?: string[] | null
    title: string
    updated_at?: string
    video_url?: string | null
  }
  Update: {
    created_at?: string
    created_by?: string | null
    id?: string
    order_index?: number
    target_roles?: string[] | null
    target_team_ids?: string[] | null
    title?: string
    updated_at?: string
    video_url?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "general_training_exercises_created_by_fkey"
      columns: ["created_by"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}