import { Database, DatabaseWithoutInternals, DefaultSchema } from './database';

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

// Export individual table types for convenience
export type AuditLog = Tables<'audit_log'>;
export type ThumbnailLike = Tables<'thumbnail_likes'>;
export type ThumbnailType = Tables<'thumbnail_types'>;
export type ThumbnailBanner = Tables<'thumbnail_banners'>;
export type ThumbnailCategory = Tables<'thumbnail_categories'>;
export type ComprehensiveReport = Tables<'shopee_comprehensive_reports'>;
export type TiktokComprehensiveReport = Tables<'tiktok_comprehensive_reports'>;
export type EduKnowledgeExercise = Tables<'edu_knowledge_exercises'>;
export type EduQuiz = Tables<'edu_quizzes'>;
export type EduQuizQuestion = Tables<'edu_quiz_questions'>;
export type EduQuizAnswer = Tables<'edu_quiz_answers'>;
export type EduQuizSubmission = Tables<'edu_quiz_submissions'>;
export type EduEssaySubmission = Tables<'edu_essay_submissions'>;
export type EssayQuestion = Tables<'edu_essay_questions'>;
export type ExerciseReviewSubmission = Tables<'exercise_review_submissions'>;
export type Feedback = Tables<'feedback'>;
export type GeneralTrainingExercise = Tables<'general_training_exercises'>;
export type PageView = Tables<'page_views'>;
export type PracticeTest = Tables<'practice_tests'>;
export type PracticeTestSubmission = Tables<'practice_test_submissions'>;
export type Profile = Tables<'profiles'>;
export type Role = Tables<'roles'>;
export type ShopRevenue = Tables<'shopee_shop_revenue'>;
export type Shop = Tables<'shopee_shops'>;
export type Department = Tables<'departments'>; // Renamed from Team
export type Team = Tables<'departments'>; // Alias for backward compatibility
export type Segment = Tables<'segments'>; // New
export type ProfileSegmentRole = Tables<'profile_segment_roles'>; // New
export type Tag = Tables<'tags'>;
export type GeneralTrainingExerciseTag = Tables<'general_training_exercise_tags'>;
export type GeneralTrainingRecap = Tables<'general_training_recaps'>;
export type UserCourseProgress = Tables<'user_course_progress'>;
export type UserExerciseProgress = Tables<'user_exercise_progress'>;
export type UserExerciseRecap = Tables<'user_exercise_recaps'>;
export type UserVideoProgress = Tables<'user_video_progress'>;