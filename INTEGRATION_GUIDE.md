# Integration Guide

This guide provides instructions for integrating the Slide Show Nexus Admin application with its core backend service, Supabase, as well as other third-party services.

## Supabase Integration

Supabase serves as the primary backend, providing database, authentication, storage, and serverless functions.

### 1. Database Setup

#### Connection Configuration

The Supabase client is initialized in `src/integrations/supabase/client.ts`. This file reads environment variables to establish the connection.

```typescript
// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

export const SUPABASE_URL = "https://tjzeskxkqvjbowikzqpv.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "your_supabase_anon_key";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
```

#### Environment Variables

Create a `.env.local` file in the root directory with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://tjzeskxkqvjbowikzqpv.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Database Schema & Migrations

-   **Schema**: The database schema is defined and managed through SQL migration files located in `supabase/migrations/`.
-   **Types**: TypeScript types are automatically generated from the database schema to ensure type safety across the application. These types are located in `src/integrations/supabase/types/`.
-   **Applying Migrations**: Use the Supabase CLI to apply local migrations to your Supabase project: `supabase db push`.

### 3. Storage Configuration

-   **Buckets**: The application uses Supabase Storage for file uploads (e.g., thumbnails, videos). Buckets like `banner-images` and `training-videos` must be created in the Supabase dashboard.
-   **Access Policies**: Row Level Security (RLS) policies are applied to storage buckets to control access for uploading and downloading files.

### 4. Edge Functions

-   **Location**: Server-side logic is written in TypeScript and located in `supabase/functions/`.
-   **Deployment**: Functions are deployed using the Supabase CLI: `supabase functions deploy <function-name>`.
-   **Invocation**: The frontend invokes edge functions securely using `supabase.functions.invoke()`.

## Frontend Integration

### Authentication

The `AuthProvider` located in `src/hooks/useAuth.tsx` wraps the entire application. It manages the user's session and provides authentication state to all components through the `useAuth` hook.

### Protected Routes

Routes are protected using a combination of `ProtectedRoute` and role-specific guards (e.g., `AdminRouteGuard`) found in `src/components/layouts/`. These components check the user's authentication status and role before rendering a page.

```tsx
// src/App.tsx
<Route
  path="/admin"
  element={
    <ProtectedRoute>
      <AdminRouteGuard>
        <AdminPanel />
      </AdminRouteGuard>
    </ProtectedRoute>
  }
/>
```

## Third-Party Integrations

### Excel File Processing (`xlsx`)

-   **Library**: The `xlsx` library is used for parsing and generating Excel files.
-   **Usage**: Implemented in Edge Functions (e.g., `upload-comprehensive-report`) to process uploaded sales reports.

### Notifications (`sonner`)

-   **Library**: `sonner` is used for displaying toast notifications.
-   **Usage**: Integrated via the `useToast` hook and the `<Toaster />` component in `App.tsx` to provide feedback for user actions.

## Deployment

The application is configured for deployment on Vercel.

-   **Configuration**: The `vercel.json` file contains rewrite rules to support client-side routing.
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist`
-   **Environment Variables**: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` must be configured in the Vercel project settings.