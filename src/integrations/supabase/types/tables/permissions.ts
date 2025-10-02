export type Permissions = {
  Row: {
    created_at: string | null
    description: string | null
    id: string
    name: string
    parent_id: string | null
  }
  Insert: {
    created_at?: string | null
    description?: string | null
    id?: string
    name: string
    parent_id?: string | null
  }
  Update: {
    created_at?: string | null
    description?: string | null
    id?: string
    name?: string
    parent_id?: string | null
  }
  Relationships: []
}