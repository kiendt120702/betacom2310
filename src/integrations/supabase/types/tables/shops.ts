export type Shops = {
  Row: {
    created_at: string
    description: string | null
    id: string
    leader_id: string | null
    name: string
    updated_at: string
    user_id: string | null
  }
  Insert: {
    created_at?: string
    description?: string | null
    id?: string
    leader_id?: string | null
    name: string
    updated_at?: string
    user_id?: string | null
  }
  Update: {
    created_at?: string
    description?: string | null
    id?: string
    leader_id?: string | null
    name?: string
    updated_at?: string
    user_id?: string | null
  }
  Relationships: []
}