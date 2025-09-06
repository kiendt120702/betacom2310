export type PublicEnums = {
  banner_status: "pending" | "approved" | "rejected"
  employee_role: "personnel" | "leader"
  feedback_status: "pending" | "reviewed" | "resolved"
  feedback_type: "bug" | "suggestion" | "general"
  question_type: "single_choice" | "multiple_choice"
  shopee_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
  tiktok_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
  user_role:
    | "admin"
    | "leader"
    | "chuyên viên"
    | "học việc/thử việc"
    | "trưởng phòng"
    | "deleted"
  work_type: "fulltime" | "parttime"
}