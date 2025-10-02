import type { Json } from "../database"

export type AuditLog = {
  Row: {
    id: string
    new_values: Json | null
    old_values: Json | null
    operation: string
    table_name: string
    timestamp: string | null
    user_id: string | null
  }
  Insert: {
    id?: string
    new_values?: Json | null
    old_values?: Json | null
    operation: string
    table_name: string
    timestamp?: string | null
    user_id?: string | null
  }
  Update: {
    id?: string
    new_values?: Json | null
    old_values?: Json | null
    operation?: string
    table_name?: string
    timestamp?: string | null
    user_id?: string | null
  }
  Relationships: []
}