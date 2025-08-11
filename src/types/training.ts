
export interface EduExercise {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
  order_index: number;
  course_id: string;
  created_at: string;
  updated_at: string;
  estimated_duration?: number;
  exercise_type: 'video' | 'reading' | 'assignment';
  requires_submission: boolean;
  exercise_video_url?: string;
  is_required: boolean;
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
  created_by: string;
  description?: string;
}
