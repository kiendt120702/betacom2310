/**
 * Common type definitions to replace 'any' types throughout the application
 */

// Generic API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  status: number;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Progress and Analytics types
export interface ProgressData {
  user_id: string;
  exercise_id: string;
  progress_percentage: number;
  completed: boolean;
  time_spent: number;
  last_updated: string;
}

export interface VideoProgressData {
  exercise_id: string;
  user_id: string;
  time_spent: number;
  video_duration: number;
  watch_percentage: number;
  session_count: number;
  total_watch_time?: number;
  total_required_watch_time?: number;
  is_requirement_met: boolean;
}

// Chart and Dashboard data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  percentage?: number;
}

export interface PerformanceMetrics {
  user_id: string;
  user_name: string;
  completion_rate: number;
  time_spent: number;
  exercises_completed: number;
  rank: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  shop_id?: string;
  shop_name?: string;
}

// Form and Upload types
export interface FileUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
}

export interface VideoMetadata {
  duration: number;
  size: number;
  format: string;
  resolution: {
    width: number;
    height: number;
  };
  bitrate?: number;
}

// User and Permission types
export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

// Notification and Toast types
export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Generic utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event handler types
export type EventHandler<T = unknown> = (data: T) => void;
export type AsyncEventHandler<T = unknown> = (data: T) => Promise<void>;

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
}

// Query key types for React Query
export type QueryKey = (string | number | boolean | object | null | undefined)[];