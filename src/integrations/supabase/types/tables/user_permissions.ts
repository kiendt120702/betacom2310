import type { PublicEnums } from "../schema-public-enums"

export type UserPermissions = {
  Row: {
    permission_id: string
    permission_type: PublicEnums["permission_type"]
    user_id: string
  }
  Insert: {
    permission_id: string
    permission_type: PublicEnums["permission_type"]
    user_id: string
  }
  Update: {
    permission_id?: string
    permission_type?: PublicEnums["permission_type"]
    user_id?: string
  }
  Relationships: []
}