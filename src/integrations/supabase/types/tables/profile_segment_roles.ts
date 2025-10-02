import type { PublicEnums } from "../schema-public-enums"

export type ProfileSegmentRoles = {
  Row: {
    created_at: string | null
    id: string
    manager_id: string | null
    profile_id: string
    role: PublicEnums["user_role"]
    segment_id: string
    updated_at: string | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    manager_id?: string | null
    profile_id: string
    role: PublicEnums["user_role"]
    segment_id: string
    updated_at?: string | null
  }
  Update: {
    created_at?: string | null
    id?: string
    manager_id?: string | null
    profile_id?: string
    role?: PublicEnums["user_role"]
    segment_id?: string
    updated_at?: string | null
  }
  Relationships: []
}