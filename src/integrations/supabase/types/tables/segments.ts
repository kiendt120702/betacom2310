export type Segments = {
  Row: {
    created_at: string | null
    department_id: string | null
    id: string
    name: string
  }
  Insert: {
    created_at?: string | null
    department_id?: string | null
    id?: string
    name: string
  }
  Update: {
    created_at?: string | null
    department_id?: string | null
    id?: string
    name?: string
  }
  Relationships: []
}