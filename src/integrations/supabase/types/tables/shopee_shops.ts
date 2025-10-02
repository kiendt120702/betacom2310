import type { PublicEnums } from "../schema-public-enums"

export type ShopeeShops = {
  Row: {
    created_at: string | null
    id: string
    name: string
    profile_id: string | null
    status: PublicEnums["shopee_shop_status"] | null
    updated_at: string | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    name: string
    profile_id?: string | null
    status?: PublicEnums["shopee_shop_status"] | null
    updated_at?: string | null
  }
  Update: {
    created_at?: string | null
    id?: string
    name?: string
    profile_id?: string | null
    status?: PublicEnums["shopee_shop_status"] | null
    updated_at?: string | null
  }
  Relationships: []
}