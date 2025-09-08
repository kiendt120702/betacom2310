# API Documentation - Slide Show Nexus Admin

## Tổng quan API

Slide Show Nexus Admin sử dụng Supabase làm backend, cung cấp các API RESTful và GraphQL thông qua Supabase client. Tất cả các API calls đều được xử lý thông qua custom hooks và TanStack Query để tối ưu caching và state management.

## Authentication API

### Supabase Auth Integration
```typescript
// Authentication methods
supabase.auth.signInWithPassword(credentials)
supabase.auth.signUp(userData)
supabase.auth.signOut()
supabase.auth.getSession()
supabase.auth.updateUser(updates)
```

### JWT Token Management
- Tokens được tự động refresh bởi Supabase client
- Session persistence trong localStorage
- Middleware tự động attach tokens vào requests

## Core API Endpoints

### 1. User Management

#### GET /rest/v1/profiles
```typescript
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'leader' | 'employee' | 'trainer';
  avatar_url?: string;
  department?: string;
  manager_id?: string;
  created_at: string;
  updated_at: string;
}
```

#### POST /rest/v1/profiles
```typescript
// Create new user profile
const createUser = async (userData: Partial<UserProfile>) => {
  return supabase.from('profiles').insert(userData);
};
```

### 2. Thumbnail Management

#### GET /rest/v1/thumbnails
```typescript
interface Thumbnail {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  type_id: string;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  creator_id: string;
  created_at: string;
}
```

#### POST /rest/v1/thumbnails
```typescript
// Upload new thumbnail
const uploadThumbnail = async (thumbnailData: {
  title: string;
  description: string;
  image_file: File;
  category_id: string;
  type_id: string;
}) => {
  // File upload to Supabase Storage
  const { data: fileData } = await supabase.storage
    .from('thumbnails')
    .upload(`${Date.now()}-${file.name}`, image_file);
  
  // Create thumbnail record
  return supabase.from('thumbnails').insert({
    ...thumbnailData,
    image_url: fileData?.path
  });
};
```

### 3. Training System

#### GET /rest/v1/training_courses
```typescript
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  theory_content: string;
  exercises: Exercise[];
  order_index: number;
  is_active: boolean;
  required_viewing_count: number;
}
```

#### GET /rest/v1/exercises
```typescript
interface Exercise {
  id: string;
  course_id: string;
  title: string;
  description: string;
  type: 'quiz' | 'essay' | 'practice';
  content: any; // JSON content
  max_score: number;
  passing_score: number;
  time_limit?: number;
}
```

#### POST /rest/v1/exercise_submissions
```typescript
interface ExerciseSubmission {
  exercise_id: string;
  user_id: string;
  answers: any; // JSON answers
  score?: number;
  status: 'submitted' | 'graded' | 'pending_review';
  submitted_at: string;
}
```

### 4. Sales Analytics

#### GET /rest/v1/comprehensive_reports
```typescript
interface ComprehensiveReport {
  id: string;
  user_id: string;
  report_date: string;
  platform: 'shopee' | 'tiktok';
  revenue: number;
  orders: number;
  conversion_rate: number;
  traffic: number;
  goal_revenue?: number;
  goal_orders?: number;
  created_at: string;
}
```

#### GET /rest/v1/shop_performance
```typescript
interface ShopPerformance {
  shop_id: string;
  shop_name: string;
  manager_id: string;
  monthly_revenue: number;
  monthly_orders: number;
  growth_rate: number;
  performance_score: number;
}
```

### 5. File Upload API

#### POST /storage/v1/object/thumbnails
```typescript
// Direct file upload to Supabase Storage
const uploadFile = async (file: File, bucket: string = 'thumbnails') => {
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });
  
  return data;
};
```

#### GET /storage/v1/object/public/thumbnails/{fileName}
```typescript
// Get public URL for uploaded file
const getPublicUrl = (fileName: string, bucket: string = 'thumbnails') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};
```

## Real-time Subscriptions

### Thumbnail Updates
```typescript
const subscribeToThumbnailUpdates = () => {
  return supabase
    .channel('thumbnail_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'thumbnails'
    }, (payload) => {
      // Handle real-time updates
    })
    .subscribe();
};
```

### Learning Progress Tracking
```typescript
const subscribeToProgressUpdates = (userId: string) => {
  return supabase
    .channel(`user_progress_${userId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_exercise_progress',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      // Update progress in real-time
    })
    .subscribe();
};
```

## Custom Hooks Architecture

### Query Hooks Pattern
```typescript
// Example: useThumbnails hook
export const useThumbnails = (filters?: ThumbnailFilters) => {
  return useQuery({
    queryKey: ['thumbnails', filters],
    queryFn: async () => {
      let query = supabase
        .from('thumbnails')
        .select('*, categories(*), types(*)');
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Mutation Hooks Pattern
```typescript
// Example: useThumbnailMutations hook
export const useThumbnailMutations = () => {
  const queryClient = useQueryClient();
  
  const createThumbnail = useMutation({
    mutationFn: async (data: CreateThumbnailData) => {
      // Upload file first
      const fileData = await uploadFile(data.image_file);
      
      // Create thumbnail record
      const { data: thumbnail, error } = await supabase
        .from('thumbnails')
        .insert({
          title: data.title,
          description: data.description,
          image_url: fileData.path,
          category_id: data.category_id,
          type_id: data.type_id
        })
        .select()
        .single();
        
      if (error) throw error;
      return thumbnail;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['thumbnails'] });
    }
  });
  
  return { createThumbnail };
};
```

## Error Handling

### Standard Error Response
```typescript
interface APIError {
  message: string;
  details?: any;
  hint?: string;
  code?: string;
}
```

### Error Handling in Hooks
```typescript
const { data, error, isLoading } = useThumbnails();

if (error) {
  // Handle different types of errors
  if (error.message.includes('JWT')) {
    // Authentication error - redirect to login
    navigate('/auth');
  } else if (error.code === 'PGRST116') {
    // Row level security violation
    toast.error('Access denied');
  } else {
    // Generic error
    toast.error(error.message);
  }
}
```

## Rate Limiting và Caching

### TanStack Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 30 * 60 * 1000,    // 30 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    }
  }
});
```

### Optimistic Updates
```typescript
const updateThumbnailStatus = useMutation({
  mutationFn: updateThumbnailStatusAPI,
  onMutate: async (newStatus) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['thumbnails'] });
    
    // Snapshot previous value
    const previousThumbnails = queryClient.getQueryData(['thumbnails']);
    
    // Optimistically update
    queryClient.setQueryData(['thumbnails'], (old: Thumbnail[]) => 
      old.map(thumb => 
        thumb.id === newStatus.id 
          ? { ...thumb, status: newStatus.status }
          : thumb
      )
    );
    
    return { previousThumbnails };
  },
  onError: (err, newStatus, context) => {
    // Rollback on error
    queryClient.setQueryData(['thumbnails'], context?.previousThumbnails);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['thumbnails'] });
  }
});
```

## Security và Authorization

### Row Level Security (RLS)
- Tất cả tables đều có RLS policies
- Users chỉ có thể truy cập data thuộc quyền của mình
- Admin có full access với bypass RLS

### API Security Headers
```typescript
// Supabase client configuration
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'x-application-name': 'slide-show-nexus-admin'
      }
    }
  }
);
```