export type UserActiveSessions = {
  Row: {
    created_at: string | null
    expires_at: string | null
    id: string
    ip_address: string | null
    is_active: boolean | null
    last_activity: string | null
    session_id: string | null
    user_agent: string | null
    user_id: string | null
  }
  Insert: {
    created_at?: string | null
    expires_at?: string | null
    id?: string
    ip_address?: string | null
    is_active?: boolean | null
    last_activity?: string | null
    session_id?: string | null
    user_agent?: string | null
    user_id?: string | null
  }
  Update: {
    created_at?: string | null
    expires_at?: string | null
    id?: string
    ip_address?: string | null
    is_active?: boolean | null
    last_activity?: string | null
    session_id?: string | null
    user_agent?: string | null
    user_id?: string | null
  }
  Relationships: []
}