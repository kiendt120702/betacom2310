import type { Database } from "@/integrations/supabase/types";

export type BannerStatus = Database["public"]["Enums"]["banner_status"];
export type EmployeeRole = Database["public"]["Enums"]["employee_role"];
export type FeedbackStatus = Database["public"]["Enums"]["feedback_status"];
export type ShopStatus = Database["public"]["Enums"]["shop_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type WorkType = Database["public"]["Enums"]["work_type"];