export type PublicEnums = {
  banner_status: "pending" | "approved" | "rejected"
  feedback_status: "pending" | "reviewed" | "resolved"
  feedback_type: "bug" | "suggestion" | "general"
  permission_type: "grant" | "deny"
  question_type: "single_choice" | "multiple_choice"
  shopee_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
  tiktok_shop_status: "Shop mới" | "Đang Vận Hành" | "Đã Dừng"
  tiktok_shop_type: "Vận hành" | "Booking"
  user_role:
    | "admin"
    | "leader"
    | "chuyên viên"
    | "học việc/thử việc"
    | "trưởng phòng"
    | "deleted"
    | "booking"
  work_type: "fulltime" | "parttime"
}