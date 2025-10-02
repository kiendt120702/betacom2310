export type ShopeeComprehensiveReports = {
  Row: {
    average_order_value: number | null
    breakthrough_goal: number | null
    buyer_return_rate: number | null
    cancelled_orders: number | null
    cancelled_revenue: number | null
    conversion_rate: number | null
    created_at: string
    existing_buyers: number | null
    feasible_goal: number | null
    id: string
    new_buyers: number | null
    potential_buyers: number | null
    product_clicks: number | null
    report_date: string
    returned_orders: number | null
    returned_revenue: number | null
    shop_id: string | null
    total_buyers: number | null
    total_orders: number | null
    total_revenue: number | null
    total_visits: number | null
    updated_at: string
  }
  Insert: {
    average_order_value?: number | null
    breakthrough_goal?: number | null
    buyer_return_rate?: number | null
    cancelled_orders?: number | null
    cancelled_revenue?: number | null
    conversion_rate?: number | null
    created_at?: string
    existing_buyers?: number | null
    feasible_goal?: number | null
    id?: string
    new_buyers?: number | null
    potential_buyers?: number | null
    product_clicks?: number | null
    report_date: string
    returned_orders?: number | null
    returned_revenue?: number | null
    shop_id?: string | null
    total_buyers?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    total_visits?: number | null
    updated_at?: string
  }
  Update: {
    average_order_value?: number | null
    breakthrough_goal?: number | null
    buyer_return_rate?: number | null
    cancelled_orders?: number | null
    cancelled_revenue?: number | null
    conversion_rate?: number | null
    created_at?: string
    existing_buyers?: number | null
    feasible_goal?: number | null
    id?: string
    new_buyers?: number | null
    potential_buyers?: number | null
    product_clicks?: number | null
    report_date?: string
    returned_orders?: number | null
    returned_revenue?: number | null
    shop_id?: string | null
    total_buyers?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    total_visits?: number | null
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "comprehensive_reports_shop_id_fkey"
      columns: ["shop_id"]
      isOneToOne: false
      referencedRelation: "shopee_shops"
      referencedColumns: ["id"]
    },
  ]
}