import { Database } from './database';

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  TableName extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
> = (PublicSchema["Tables"] & PublicSchema["Views"])[TableName] extends {
  Row: infer R;
}
  ? R
  : never;

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName] extends {
  Insert: infer I;
}
  ? I
  : never;

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"]
> = PublicSchema["Tables"][TableName] extends {
  Update: infer U;
}
  ? U
  : never;

// Export individual table types for convenience
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
export type EduQuiz = Tables<'edu_quizzes'>;
export type EduQuizQuestion = Tables<'edu_quiz_questions'>;
export type EduQuizAnswer = Tables<'edu_quiz_answers'>;
export type EduQuizSubmission = Tables<'edu_quiz_submissions'>;
export type Employee = Tables<'employees'>;
export type ExerciseReviewSubmission = Tables<'exercise_review_submissions'>;
export type Feedback = Tables<'feedback'>;
export type Gpt4oMiniConversation = Tables<'gpt4o_mini_conversations'>;
export type Gpt4oMiniMessage = Tables<'gpt4o_mini_messages'>;
export type PageView = Tables<'page_views'>;
export type PracticeTest = Tables<'practice_tests'>;
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
export type UploadHistory = Tables<'upload_history'>;
export type UserCourseProgress = Tables<'user_course_progress'>;
export type UserExerciseProgress = Tables<'user_exercise_progress'>;
export type UserExerciseRecap = Tables<'user_exercise_recaps'>;
export type UserVideoProgress = Tables<'user_video_progress'>;