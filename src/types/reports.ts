// Strong TypeScript interfaces for Reports feature

export type ShopStatus = 'Đang Vận Hành' | 'Shop mới' | 'Đã Dừng' | 'Chưa có'

export type ColorCategory = 'green' | 'yellow' | 'red' | 'purple' | 'no-color'

export interface ShopReportData {
  shop_id: string
  shop_name: string
  shop_status: ShopStatus
  personnel_id: string | null
  personnel_name: string
  personnel_account: string
  leader_name: string
  total_revenue: number
  total_cancelled_revenue: number
  total_returned_revenue: number
  feasible_goal: number | null
  breakthrough_goal: number | null
  projected_revenue: number
  report_id: string | null
  last_report_date: string | null
  total_previous_month_revenue: number
  like_for_like_previous_month_revenue: number
}

export interface Employee {
  id: string
  name: string
}

export interface ReportFilters {
  selectedMonth: string
  selectedLeader: string
  selectedPersonnel: string
  searchTerm: string
  selectedColorFilter: string
  selectedStatusFilter: string[]
}

export interface ReportStatistics {
  total: number
  green: number
  yellow: number
  red: number
  purple: number
  noColor: number
  'Đang Vận Hành': number
  'Shop mới': number
  'Đã Dừng': number
}

export interface SortConfig {
  key: 'total_revenue'
  direction: 'asc' | 'desc'
}

export interface RevenueCalculation {
  total_revenue: number
  total_cancelled_revenue: number
  total_returned_revenue: number
  projected_revenue: number
}

export interface MonthOption {
  value: string
  label: string
}

export interface UnderperformingShop {
  shop_name: string;
  total_revenue: number;
  projected_revenue: number;
  feasible_goal: number | null | undefined;
  breakthrough_goal: number | null | undefined;
  deficit: number;
}

export interface PersonnelAchievement {
  personnel_name: string;
  leader_name: string;
  shop_names: string[];
}