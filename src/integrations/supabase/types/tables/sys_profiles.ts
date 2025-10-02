import type { PublicEnums } from "../schema-public-enums"

export type SysProfiles = {
  Row: {
    created_at: string
    email: string
    full_name: string | null
    id: string
    join_date: string | null
    manager_id: string | null
    phone: string | null
    role: PublicEnums["user_role"] | null
    team_id: string | null
    updated_at: string
    work_type: PublicEnums["work_type"] | null
  }
  Insert: {
    created_at?: string
    email: string
    full_name?: string | null
    id: string
    join_date?: string | null
    manager_id?: string | null
    phone?: string | null
    role?: PublicEnums["user_role"] | null
    team_id?: string | null
    updated_at?: string
    work_type?: PublicEnums["work_type"] | null
  }
  Update: {
    created_at?: string
    email?: string
    full_name?: string | null
    id?: string
    join_date?: string | null
    manager_id?: string | null
    phone?: string | null
    role?: PublicEnums["user_role"] | null
    team_id?: string | null
    updated_at?: string
    work_type?: PublicEnums["work_type"] | null
  }
  Relationships: [
    {
      foreignKeyName: "profiles_id_fkey"
      columns: ["id"]
      isOneToOne: true
      referencedRelation: "users"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "profiles_team_id_fkey"
      columns: ["team_id"]
      isOneToOne: false
      referencedRelation: "sys_departments"
      referencedColumns: ["id"]
    },
  ]
}