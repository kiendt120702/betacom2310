export type ShopeeShopRevenue = {
  Row: {
    created_at: string | null
    id: string
    revenue_amount: number
    revenue_date: string
    shop_id: string
    uploaded_by: string | null
  }
  Insert: {
    created_at?: string | null
    id?: string
    revenue_amount: number
    revenue_date: string
    shop_id: string
    uploaded_by?: string | null
  }
  Update: {
    created_at?: string | null
    id?: string
    revenue_amount?: number
    revenue_date?: string
    shop_id?: string
    uploaded_by?: string | null
  }
  Relationships: [
    {
      foreignKeyName: "shop_revenue_shop_id_fkey"
      columns: ["shop_id"]
      isOneToOne: false
      referencedRelation: "shopee_shops"
      referencedColumns: ["id"]
    },
    {
      foreignKeyName: "shop_revenue_uploaded_by_fkey"
      columns: ["uploaded_by"]
      isOneToOne: false
      referencedRelation: "sys_profiles"
      referencedColumns: ["id"]
    },
  ]
}