import type { PublicEnums } from "../schema-public-enums"

export type TiktokShops = {
  Row: {
    created_at: string | null
    id: string
    name: string
    profile_id: string | null
    status: PublicEnums["tiktok_shop_status"] | null
    type: PublicEnums["tiktok_shop_type"]
    updated_at: string | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    name: string
    profile_id?: string | null
    status?: PublicEnums["tiktok_shop_status"] | null
    type?: PublicEnums["tiktok_shop_type"]
    updated_at?: string | null
  }
  Update: {
    created_at?: string | null
    id?: string
    name?: string
    profile_id?: string | null
    status?: PublicEnums["tiktok_shop_status"] | null
    type?: PublicEnums["tiktok_shop_type"]
    updated_at?: string | null
  }
  Relationships: []
}