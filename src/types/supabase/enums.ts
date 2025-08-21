import type { Database } from "@/integrations/supabase/types";

export type BannerStatus = Database["public"]["Enums"]["banner_status"];
export type EmployeeRole = Database["public"]["Enums"]["employee_role"];
export type FeedbackStatus = Database["public"]["Enums"]["feedback_status"];
export type FeedbackType = Database["public"]["Enums"]["feedback_type"];
export type QuestionType = Database["public"]["Enums"]["question_type"];
export type ShopStatus = Database["public"]["Enums"]["shop_status"];
export type UserRole = Database["public"]["Enums"]["user_role"] | "trưởng phòng"; // Thêm 'trưởng phòng'
export type WorkType = Database["public"]["Enums"]["work_type"];