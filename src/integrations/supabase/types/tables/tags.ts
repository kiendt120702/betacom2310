export type Tags = {
  Row: {
    created_at: string | null
    id: string
    name: string
  }
  Insert: {
    created_at?: string | null
    id?: string
    name: string
  }
  Update: {
    created_at?: string | null
    id?: string
    name?: string
  }
  Relationships: []
}