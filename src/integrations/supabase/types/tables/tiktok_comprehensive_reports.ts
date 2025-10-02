export type TiktokComprehensiveReports = {
  Row: {
    breakthrough_goal: number | null
    cancelled_orders: number | null
    cancelled_revenue: number | null
    conversion_rate: number | null
    created_at: string | null
    feasible_goal: number | null
    id: string
    items_sold: number | null
    platform_subsidized_revenue: number | null
    report_date: string
    returned_revenue: number | null
    shop_id: string | null
    sku_orders: number | null
    store_visits: number | null
    total_buyers: number | null
    total_orders: number | null
    total_revenue: number | null
    total_visits: number | null
    updated_at: string | null
  }
  Insert: {
    breakthrough_goal?: number | null
    cancelled_orders?: number | null
    cancelled_revenue?: number | null
    conversion_rate?: number | null
    created_at?: string | null
    feasible_goal?: number | null
    id?: string
    items_sold?: number | null
    platform_subsidized_revenue?: number | null
    report_date: string
    returned_revenue?: number | null
    shop_id?: string | null
    sku_orders?: number | null
    store_visits?: number | null
    total_buyers?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    total_visits?: number | null
    updated_at?: string | null
  }
  Update: {
    breakthrough_goal?: number | null
    cancelled_orders?: number | null
    cancelled_revenue?: number | null
    conversion_rate?: number | null
    created_at?: string | null
    feasible_goal?: number | null
    id?: string
    items_sold?: number | null
    platform_subsidized_revenue?: number | null
    report_date?: string
    returned_revenue?: number | null
    shop_id?: string | null
    sku_orders?: number | null
    store_visits?: number | null
    total_buyers?: number | null
    total_orders?: number | null
    total_revenue?: number | null
    total_visits?: number | null
    updated_at?: string | null
  }
  Relationships: []
}