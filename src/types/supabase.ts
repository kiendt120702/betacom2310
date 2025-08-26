import { Json } from "./json";

export type Database = {
  public: {
    Tables: {
      edu_essay_submissions: {
        Row: {
          answers: Json | null;
          created_at: string;
          exercise_id: string;
          grader_feedback: string | null;
          id: string;
          score: number | null;
          started_at: string | null;
          status: string | null;
          submitted_at: string | null;
          time_limit_minutes: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          answers?: Json | null;
          created_at?: string;
          exercise_id: string;
          grader_feedback?: string | null;
          id?: string;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          submitted_at?: string | null;
          time_limit_minutes?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          answers?: Json | null;
          created_at?: string;
          exercise_id?: string;
          grader_feedback?: string | null;
          id?: string;
          score?: number | null;
          started_at?: string | null;
          status?: string | null;
          submitted_at?: string | null;
          time_limit_minutes?: number | null;
          updated_at?: string;
          user_id?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
        };
      };
      edu_knowledge_exercises: {
        Row: {
          id: string;
          title: string;
        };
        Insert: {
          id?: string;
          title: string;
        };
        Update: {
          id?: string;
          title?: string;
        };
      };
    };
    Functions: {
      start_essay_test: {
        Args: {
          p_exercise_id: string;
          p_time_limit?: number;
        };
        Returns: Json;
      };
    };
  };
};