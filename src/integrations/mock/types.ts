export type WorkType = "fulltime" | "parttime";

export type RoleName =
  | "admin"
  | "leader"
  | "trưởng phòng"
  | "chuyên viên"
  | "học việc/thử việc"
  | "deleted";

export interface SysDepartment {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface SysRole {
  id: string;
  name: RoleName;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SysProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: RoleName;
  work_type: WorkType;
  department_id: string | null;
  manager_id: string | null;
  join_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface HydratedProfile extends SysProfile {
  departments: SysDepartment | null;
  manager: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
}

export type ShopStatus = "Shop mới" | "Đang Vận Hành" | "Đã Dừng";

export interface ShopeeShop {
  id: string;
  name: string;
  profile_id: string | null;
  status: ShopStatus;
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopeeComprehensiveReport {
  id: string;
  shop_id: string;
  report_date: string;
  total_revenue: number;
  total_orders: number;
  total_visits: number;
  product_clicks: number;
  average_order_value: number | null;
  conversion_rate: number | null;
  buyer_return_rate: number | null;
  cancelled_orders: number | null;
  cancelled_revenue: number | null;
  existing_buyers: number | null;
  new_buyers: number | null;
  potential_buyers: number | null;
  returned_orders: number | null;
  returned_revenue: number | null;
  total_buyers: number | null;
  feasible_goal: number | null;
  breakthrough_goal: number | null;
  created_at: string;
  updated_at: string;
}

export interface ShopeeShopRevenue {
  id: string;
  shop_id: string;
  revenue_date: string;
  revenue_amount: number;
  uploaded_by: string;
  created_at: string;
}

export interface UserExerciseProgress {
  id: string;
  user_id: string;
  exercise_id: string;
  is_completed: boolean;
  video_completed: boolean;
  recap_submitted: boolean;
  quiz_passed: boolean;
  theory_read: boolean;
  time_spent: number;
  video_view_count: number;
  video_duration?: number | null;
  watch_percentage?: number | null;
  session_count?: number | null;
  notes?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  password: string;
  profile_id: string;
}

export interface MockUser {
  id: string;
  email: string;
  user_metadata: {
    full_name?: string | null;
    role?: RoleName;
    department_id?: string | null;
    work_type?: WorkType;
  };
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  user: MockUser;
  expires_in: number;
  expires_at: number;
}

export interface StorageFile {
  id: string;
  name: string;
  content: string;
  mimeType: string;
  created_at: string;
}

export interface BannerImage extends StorageFile {}
