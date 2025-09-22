# Slide Show Nexus Admin - Architecture Guide

This document outlines the architecture, project structure, and conventions used in the Slide Show Nexus Admin application. Adhering to these guidelines ensures consistency, maintainability, and scalability.

## 1. Project Structure and File Naming Convention

The project follows a "domain-by-type" structure, organizing files based on their function (e.g., components, hooks, pages). This approach is simple and effective for this project's scale.

### Root Folder Layout

```
.
├── public/              # Static assets (images, fonts, etc.)
├── src/                 # Main application source code
│   ├── components/      # Reusable UI components
│   │   ├── admin/       # Components specific to the admin panel
│   │   ├── dashboard/   # Components for analytics dashboards
│   │   ├── layouts/     # Page layout components and route guards
│   │   ├── ui/          # Base UI components from shadcn/ui
│   │   └── ...          # Other domain-specific components
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom React hooks for business logic
│   ├── integrations/    # Third-party service integrations (e.g., Supabase)
│   ├── lib/             # Utility functions and helpers
│   ├── pages/           # Route-level page components
│   ├── styles/          # Global CSS and styling files
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main application component with routing
│   └── main.tsx         # Application entry point
├── supabase/            # Supabase-specific files
│   ├── functions/       # Edge Functions
│   └── migrations/      # Database migrations
├── tailwind.config.ts   # Tailwind CSS configuration
├── vite.config.ts       # Vite build configuration
└── package.json         # Project dependencies and scripts
```

### File Naming Conventions

-   **Components**: `PascalCase.tsx` (e.g., `UserProfile.tsx`, `DataTable.tsx`)
-   **Pages**: `PascalCasePage.tsx` (e.g., `HomePage.tsx`, `SettingsPage.tsx`)
-   **Hooks**: `useCamelCase.ts` (e.g., `useUserProfile.ts`, `useDebounce.ts`)
-   **Contexts**: `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`)
-   **Utilities**: `camelCase.ts` (e.g., `dateUtils.ts`, `validation.ts`)
-   **Supabase Migrations**: `YYYYMMDDHHMMSS_description.sql` (auto-generated)
-   **Supabase Functions**: `function-name/index.ts` (e.g., `create-user/index.ts`)

## 2. Architectural Layers

The application is structured into several logical layers, each with distinct responsibilities.

### Layer 1: Presentation (UI)

-   **Location**: `src/components/`, `src/pages/`
-   **Responsibility**: Renders the user interface and handles user interactions. Pages assemble components into full views, while components are reusable UI elements.
-   **Implementation Guidance**:
    -   Use components from `shadcn/ui` as the base.
    -   Keep components small, focused, and reusable.
    -   Separate presentational components (how things look) from container components (how things work).
    -   Use `React.lazy()` for page components to enable code-splitting.

### Layer 2: Routing & Layout

-   **Location**: `src/App.tsx`, `src/components/layouts/`
-   **Responsibility**: Manages URL-based navigation, defines page layouts, and protects routes based on user authentication and authorization.
-   **Implementation Guidance**:
    -   Use `react-router-dom` for all routing logic, centralized in `App.tsx`.
    -   Create route guards (e.g., `AdminRouteGuard.tsx`) to protect specific routes.
    -   Use layout components (e.g., `MainLayout.tsx`) to provide consistent page structure.

### Layer 3: State & Data Access

-   **Location**: `src/hooks/`, `src/contexts/`
-   **Responsibility**: Manages application state and handles all data fetching, caching, and mutations.
-   **Implementation Guidance**:
    -   Use **TanStack Query (`@tanstack/react-query`)** for all server state management (fetching, caching, updating data from Supabase).
    -   Create custom hooks (`use...`) to encapsulate data-fetching logic for specific domains (e.g., `useUsers.ts`, `useThumbnails.ts`).
    -   Use **React Context** for global UI state that doesn't come from the server (e.g., theme, sidebar state).

### Layer 4: Services & Integrations

-   **Location**: `src/integrations/`
-   **Responsibility**: Manages communication with external services, primarily Supabase.
-   **Implementation Guidance**:
    -   Centralize the Supabase client initialization in `src/integrations/supabase/client.ts`.
    -   Generate TypeScript types from the Supabase schema to ensure type safety.
    -   Edge Functions logic resides in `supabase/functions/`.

### Layer 5: Utilities & Types

-   **Location**: `src/lib/`, `src/types/`
-   **Responsibility**: Provides reusable helper functions and shared TypeScript definitions.
-   **Implementation Guidance**:
    -   Utility functions in `src/lib/` should be pure and have no side effects.
    -   Shared TypeScript types and interfaces go in `src/types/`.
    -   Use Zod in `src/lib/validation.ts` for runtime data validation schemas.

### Layer 6: Styles & Theming

-   **Location**: `src/styles/`, `tailwind.config.ts`, `src/index.css`
-   **Responsibility**: Defines the visual appearance, theme, and global styles of the application.
-   **Implementation Guidance**:
    -   Prioritize **Tailwind CSS utility classes** for styling.
    -   Define theme variables (colors, fonts, spacing) in `tailwind.config.ts` and `src/index.css`.
    -   Use global styles in `src/index.css` only for base element styling or third-party library overrides.

## 3. Feature Organization

When adding a new feature (e.g., "Analytics"), follow these steps to integrate it into the existing structure:

1.  **Create Page(s)**: Add the main page component in `src/pages/AnalyticsPage.tsx`.
2.  **Add Route**: Add the new route to `src/App.tsx`, wrapping it in appropriate route guards if necessary.
    ```tsx
    const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'));
    // ...
    <Route path="/analytics" element={<AdminRouteGuard><AnalyticsPage /></AdminRouteGuard>} />
    ```
3.  **Create Components**: Place reusable components specific to the feature in a new sub-folder: `src/components/analytics/`.
4.  **Create Hooks**: Encapsulate data fetching and business logic in a new hook: `src/hooks/useAnalyticsData.ts`.
5.  **Add Types**: If the feature introduces new data structures, define them in `src/types/analytics.ts`.
6.  **Add Utilities**: Place any helper functions for the feature in `src/lib/analyticsUtils.ts`.

This approach keeps the codebase organized by function while still allowing for clear separation of feature-specific logic.