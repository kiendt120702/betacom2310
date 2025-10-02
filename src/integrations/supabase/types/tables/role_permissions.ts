import type { PublicEnums } from "../schema-public-enums"

export type RolePermissions = {
  Row: {
    permission_id: string
    role: PublicEnums["user_role"]
  }
  Insert: {
    permission_id: string
    role: PublicEnums["user_role"]
  }
  Update: {
    permission_id?: string
    role?: PublicEnums["user_role"]
  }
  Relationships: []
}