import type { Database, Tables, Enums, Json, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

// Enums
export type BannerStatus = Database["public"]["Enums"]["banner_status"];
export type EmployeeRole = Database["public"]["Enums"]["employee_role"];
export type ShopStatus = Database["public"]["Enums"]["shop_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type WorkType = Database["public"]["Enums"]["work_type"];

// Tables
export type Assignment = Tables<'assignments'>;
export type AssignmentSubmission = Tables<'assignment_submissions'>;
export type AuditLog = Tables<'audit_log'>;
export type BannerLike = Tables<'banner_likes'>;
export type BannerType = Tables<'banner_types'>;
export type Banner = Tables<'banners'>;
export type Category = Tables<'categories'>;
export type ComprehensiveReport = Tables<'comprehensive_reports'>;
export type DailyShopMetric = Tables<'daily_shop_metrics'>;
export type EduKnowledgeExercise = Tables<'edu_knowledge_exercises'>;
export type Employee = Tables<'employees'>;
export type ExerciseReviewSubmission = Tables<'exercise_review_submissions'>;
export type Gpt4oMiniConversation = Tables<'gpt4o_mini_conversations'>;
export type Gpt4oMiniMessage = Tables<'gpt4o_mini_messages'>;
export type Profile = Tables<'profiles'>;
export type Role = Tables<'roles'>;
export type SeoChatConversation = Tables<'seo_chat_conversations'>;
export type SeoChatMessage = Tables<'seo_chat_messages'>;
export type SeoKnowledge = Tables<'seo_knowledge'>;
export type ShopRevenue = Tables<'shop_revenue'>;
export type Shop = Tables<'shops'>;
export type Strategy = Tables<'strategies'>;
export type Team = Tables<'teams'>;
export type TrainingCourse = Tables<'training_courses'>;
export type TrainingVideo = Tables<'training_videos'>;
export type UserCourseProgress = Tables<'user_course_progress'>;
export type UserExerciseProgress = Tables<'user_exercise_progress'>;
export type UserExerciseRecap = Tables<'user_exercise_recaps'>;
export type UserVideoProgress = Tables<'user_video_progress'>;
export type UploadHistory = Tables<'upload_history'>;

// Utility Types
export type { Json, Tables, TablesInsert, TablesUpdate, Enums };