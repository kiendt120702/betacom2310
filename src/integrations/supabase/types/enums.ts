import { Database } from './database';

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Enums<
  EnumName extends keyof PublicSchema["Enums"]
> = PublicSchema["Enums"][EnumName];

// Export individual enum types for convenience
export type BannerStatus = Enums<'banner_status'>;
export type EmployeeRole = Enums<'employee_role'>;
export type FeedbackStatus = Enums<'feedback_status'>;
export type FeedbackType = Enums<'feedback_type'>;
export type QuestionType = Enums<'question_type'>;
export type ShopStatus = Enums<'shop_status'>;
export type UserRole = Enums<'user_role'>;
export type WorkType = Enums<'work_type'>;

export const Constants = {
  public: {
    Enums: {
      banner_status: ["pending", "approved", "rejected"],
      employee_role: ["personnel", "leader"],
      feedback_status: ["pending", "reviewed", "resolved"],
      feedback_type: ["bug", "suggestion", "general"],
      question_type: ["single_choice", "multiple_choice"],
      shop_status: ["Shop mới", "Đang Vận Hành", "Đã Dừng"],
      user_role: [
        "admin",
        "leader",
        "chuyên viên",
        "học việc/thử việc",
        "trưởng phòng",
        "deleted",
      ],
      work_type: ["fulltime", "parttime"],
    },
  },
} as const;