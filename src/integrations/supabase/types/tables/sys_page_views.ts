export type SysPageViews = {
  Row: {
    created_at: string
    id: string
    path: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    id?: string
    path: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    id?: string
    path?: string
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "page_views_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}