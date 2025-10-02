export type SysRoles = {
  Row: {
    created_at: string
    description: string | null
    id: string
    name: string
    updated_at: string
  }
  Insert: {
    created_at?: string
    description?: string | null
    id?: string
    name: string
    updated_at?: string
  }
  Update: {
    created_at?: string
    description?: string | null
    id?: string
    name?: string
    updated_at?: string
  }
  Relationships: []
}