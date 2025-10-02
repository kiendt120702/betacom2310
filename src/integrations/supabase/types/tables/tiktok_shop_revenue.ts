export type TiktokShopRevenue = {
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
  Relationships: []
}