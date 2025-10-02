import type { PublicEnums } from "../schema-public-enums"

export type SysFeedback = {
  Row: {
    content: string | null
    created_at: string | null
    feedback_type: PublicEnums["feedback_type"] | null
    id: string
    image_url: string | null
    resolved_at: string | null
    resolved_by: string | null
    status: PublicEnums["feedback_status"] | null
    user_id: string | null
  }
  Insert: {
    content?: string | null
    created_at?: string | null
    feedback_type?: PublicEnums["feedback_type"] | null
    id?: string
    image_url?: string | null
    resolved_at?: string | null
    resolved_by?: string | null
    status?: PublicEnums["feedback_status"] | null
    user_id?: string | null
  }
  Update: {
    content?: string | null
    created_at?: string | null
    feedback_type?: PublicEnums["feedback_type"] | null
    id?: string
    image_url?: string | null
    resolved_at?: string | null
    resolved_by?: string | null
    status?: PublicEnums["feedback_status"] | null
    user_id?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "feedback_resolved_by_fkey"
      columns: ["resolved_by"]
      isOneToOne: false
      referencedRelation: "sys_profiles"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "feedback_user_id_fkey"
      columns: ["user_id"]
      isOneToOne: false
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
  ]
}