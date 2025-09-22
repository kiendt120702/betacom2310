# API Documentation

This document provides an overview of the API structure, data models, and data access patterns for the Slide Show Nexus Admin application. The backend is powered by Supabase, which provides RESTful endpoints, real-time capabilities, and serverless functions.

## Authentication API

Authentication is handled entirely by Supabase Auth. The frontend client interacts with Supabase using the following methods:

-   `supabase.auth.signInWithPassword()`: User login.
-   `supabase.auth.signUp()`: User registration (if enabled).
-   `supabase.auth.signOut()`: User logout.
-   `supabase.auth.getSession()`: Retrieve the current session.
-   `supabase.auth.onAuthStateChange()`: Listen for authentication events.

JWT tokens are managed automatically by the Supabase client library, which handles storage, refresh, and injection into API requests.

## Core API Endpoints (via Supabase REST)

The following are the primary data models and tables accessible through the Supabase REST API. All interactions are performed via the Supabase client library, which respects Row Level Security (RLS) policies.

### 1. User Management (`profiles` table)

-   **Endpoint**: `/rest/v1/profiles`
-   **Description**: Manages user profile information, roles, and relationships.
-   **Key Columns**: `id`, `user_id`, `full_name`, `email`, `role`, `team_id`, `manager_id`.

### 2. Thumbnail Management (`thumbnail_banners` table)

-   **Endpoint**: `/rest/v1/thumbnail_banners`
-   **Description**: Stores information about uploaded thumbnail assets.
-   **Key Columns**: `id`, `name`, `image_url`, `status`, `user_id`, `thumbnail_category_id`, `thumbnail_type_id`.

### 3. Training System (`edu_knowledge_exercises` table)

-   **Endpoint**: `/rest/v1/edu_knowledge_exercises`
-   **Description**: Defines the structure and content of training courses and exercises.
-   **Key Columns**: `id`, `title`, `order_index`, `exercise_video_url`, `min_review_videos`, `required_viewing_count`.

### 4. Sales Analytics (`shopee_comprehensive_reports` & `tiktok_comprehensive_reports` tables)

-   **Endpoints**: `/rest/v1/shopee_comprehensive_reports`, `/rest/v1/tiktok_comprehensive_reports`
-   **Description**: Stores daily aggregated sales and performance data from e-commerce platforms.
-   **Key Columns**: `report_date`, `shop_id`, `total_revenue`, `total_orders`, `total_visits`, `feasible_goal`, `breakthrough_goal`.

## Serverless Functions (Edge Functions)

Complex or sensitive operations are handled by Supabase Edge Functions.

-   `create-user`: Securely creates a new user and their associated profile.
-   `manage-user-profile`: Updates user profiles and auth data with permission checks.
-   `delete-user`: Securely deletes a user and their associated data.
-   `upload-comprehensive-report`: Processes and inserts bulk sales data from Excel files.

## Data Access Architecture (Custom Hooks)

All data fetching and mutations are encapsulated within custom React hooks using TanStack Query. This provides a consistent, efficient, and type-safe way to interact with the API.

### Query Hooks Pattern

Query hooks are used for fetching data. They handle caching, refetching, and state management automatically.

```typescript
// Example: src/hooks/useUsers.ts
export const useUsers = (params) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async () => {
      // Supabase query logic here...
    },
  });
};
```

### Mutation Hooks Pattern

Mutation hooks are used for creating, updating, and deleting data. They handle loading states, error handling, and cache invalidation.

```typescript
// Example: src/hooks/useUsers.ts
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData) => {
      // Supabase Edge Function invocation...
    },
    onSuccess: () => {
      // Invalidate the user list to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

## Error Handling

-   **Client-Side**: TanStack Query's `error` state is used to catch and display API errors in the UI.
-   **Server-Side**: Edge Functions return structured JSON error responses with appropriate HTTP status codes.
-   **User Feedback**: The `sonner` library is used to display user-friendly toast notifications for success and error states.