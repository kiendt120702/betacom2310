import type { PublicEnums } from "../schema-public-enums"

export type ThumbnailBanners = {
  Row: {
    approved_at: string | null
    approved_by: string | null
    canva_link: string | null
    created_at: string
    id: string
    image_url: string
    name: string
    status: PublicEnums["banner_status"] | null
    thumbnail_category_id: string | null
    thumbnail_type_id: string | null
    updated_at: string
    user_id: string
  }
  Insert: {
    approved_at?: string | null
    approved_by?: string | null
    canva_link?: string | null
    created_at?: string
    id?: string
    image_url: string
    name: string
    status?: PublicEnums["banner_status"] | null
    thumbnail_category_id?: string | null
    thumbnail_type_id?: string | null
    updated_at?: string
    user_id: string
  }
  Update: {
    approved_at?: string | null
    approved_by?: string | null
    canva_link?: string | null
    created_at?: string
    id?: string
    image_url?: string
    name?: string
    status?: PublicEnums["banner_status"] | null
    thumbnail_category_id?: string | null
    thumbnail_type_id?: string | null
    updated_at?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "banners_banner_type_id_fkey"
      columns: ["thumbnail_type_id"]
      isOneToOne: false
      referencedRelation: "thumbnail_types"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "banners_category_id_fkey"
      columns: ["thumbnail_category_id"]
      isOneToOne: false
      referencedRelation: "thumbnail_categories"
      referencedColumns: ["id"]
    },
  ]
}