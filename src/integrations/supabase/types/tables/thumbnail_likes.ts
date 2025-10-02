export type ThumbnailLikes = {
  Row: {
    created_at: string
    id: string
    thumbnail_banner_id: string
    updated_at: string
    user_id: string
  }
  Insert: {
    created_at?: string
    id?: string
    thumbnail_banner_id: string
    updated_at?: string
    user_id: string
  }
  Update: {
    created_at?: string
    id?: string
    thumbnail_banner_id?: string
    updated_at?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "banner_likes_banner_id_fkey"
      columns: ["thumbnail_banner_id"]
      isOneToOne: false
      referencedRelation: "thumbnail_banners"
      referencedColumns: ["id"]
    },
  ]
}