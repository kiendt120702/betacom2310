import { Json } from "@/integrations/supabase/types";

export interface EduExerciseDB {
  id: string;
  title: string;
  content: string | null;
  order_index: number;
  is_required: boolean;
  is_checkpoint: boolean; // New field for checkpoints
  essay_questions_per_test: number;
  exercise_video_url: string | null; // This is the actual video URL from DB
  min_study_sessions: number;
  min_review_videos: number;
  required_review_videos: number;
  required_viewing_count: number; // Number of times video must be viewed
  created_by: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  min_completion_time: number | null;
  target_roles: string[] | null;
  target_team_ids: string[] | null;
  documents: Json | null;
  has_video: boolean;
  has_theory_test: boolean;
  has_practice_test: boolean;
  has_review_video: boolean;
}

// This is the type consumed by frontend components
export interface TrainingExercise extends EduExerciseDB {
  // Derived properties for frontend use
  exercise_type: 'video' | 'reading' | 'assignment'; // Derived based on content/video
  requires_submission: boolean; // Derived based on required_review_videos
  estimated_duration: number; // Derived from min_completion_time
}