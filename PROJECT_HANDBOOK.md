# Slide Show Nexus Admin Handbook

This handbook consolidates the core project documentation so contributors and assistant agents can find architecture notes, development conventions, integration steps, and API usage in one place. Sensitive values such as credentials or project-specific URLs must never be committed to the repository; always load them from environment variables.

## 1. Architecture Overview

- **Tech Stack**: React + TypeScript (Vite), Tailwind CSS, shadcn/ui, React Router, TanStack Query, Supabase, React Hook Form + Zod, Framer Motion, Sonner.
- **Entry Points**: `src/main.tsx` bootstraps React, wraps providers, and mounts `src/App.tsx`, which defines routes, guards, and layout shells.
- **Workspace Layout**:
  - `public/`: Static assets served as-is (images, fonts, site metadata).
  - `src/`: Main application code organised by type.
    - `components/`: Reusable UI building blocks grouped by domain. `_templates/` holds blueprints for new components, `ui/` mirrors shadcn/ui primitives, other folders (`admin/`, `dashboard/`, `sidebar/`, etc.) collect feature-specific elements.
    - `contexts/`: React context providers for cross-cutting UI state.
    - `hooks/`: Custom hooks encapsulating data fetching or complex state. `_templates/` stores scaffolds; `types/` contains hook-specific TypeScript helpers.
    - `integrations/`: External service adapters. The Supabase client lives in `integrations/supabase/client.ts` and should import all secrets from environment variables.
    - `lib/`: Framework-agnostic utilities and pure helpers.
    - `pages/`: Route-level screens. `_templates/` provides scaffolds; nested folders (e.g., `admin/`) group related views.
    - `styles/`: Tailwind extensions and global style fragments used alongside `src/index.css`.
    - `types/`: Shared TypeScript definitions, including generated Supabase types.
    - `utils/`: Helpers that may touch browser APIs or third-party libraries.
  - `packages/`: Secondary workspaces (`client-app/`, `shared-libs/`) for shared assets or parallel apps.
  - `supabase/`: Edge Functions and SQL migrations that define backend behaviour.
  - `scripts/*.js`: Maintenance and debugging utilities (e.g., Supabase connectivity checks, TikTok data tooling).
  - `dist/`: Build artifacts produced by Vite (should remain gitignored).

### Feature Integration Checklist

1. Create or extend page components under `src/pages/FeatureNamePage.tsx`.
2. Register the lazy-loaded page and relevant route guards within `src/App.tsx`.
3. Add feature-specific UI in `src/components/<feature>/`.
4. Encapsulate Supabase access in custom hooks under `src/hooks/`.
5. Introduce shared types in `src/types/feature.ts` and helpers in `src/lib/` if needed.

## 2. Development Workflow

1. Clone the repository and install dependencies (`npm install`).
2. Copy `.env.example` to `.env.local` and supply required secrets (see Integration section).
3. Run `npm run dev` for local development.

**Coding conventions**

- TypeScript everywhere; prefer strict types over `any`.
- Keep components small; lift complex logic into hooks under `src/hooks/`.
- Use Tailwind utility classes for styling; extend the design system via `tailwind.config.ts` when necessary.
- Run `npm run lint` before opening a PR.

**State management**

- TanStack Query handles all Supabase data (queries/mutations) inside custom hooks with descriptive query keys.
- React Context covers global UI state; local component state uses React hooks (`useState`, `useReducer`).

**Performance & UX**

- Lazy-load pages with `React.lazy()` in `App.tsx`.
- Memoize expensive computations (`React.memo`, `useMemo`, `useCallback`).
- Use the shared `LazyImage` for media-heavy views.
- Prefer lightweight dependencies; audit bundle impact if adding new packages.

**Security & Process**

- Secrets stay in environment variables; never hard-code keys or URLs.
- Sanitize user input (e.g., via `DOMPurify`) before rendering.
- Respect Supabase RLS; use Edge Functions for privileged actions.
- Work on feature branches, write clear commits, and ensure CI checks (lint/build/tests) pass before requesting review.

## 3. Integrations

### Supabase

- **Client setup**: `src/integrations/supabase/client.ts` should import credentials from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (exposed via `import.meta.env`). Example:

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types/database";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
```

- **Environment variables**: Define the following in `.env.local` (never commit real values):

```env
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

- **Database schema**: Managed via SQL scripts in `supabase/migrations/`. Apply changes with `supabase db push`.
- **Generated types**: Live under `src/integrations/supabase/types/`; regenerate when the schema changes.
- **Storage**: Configure required buckets (e.g., banner images, training videos) in the Supabase dashboard and enforce access policies to match UI expectations.
- **Edge Functions**: Located in `supabase/functions/`. Deploy using `supabase functions deploy <name>` and invoke via `supabase.functions.invoke()` from the client.

### Frontend Auth & Routing

- The authentication provider (see `src/hooks/useAuth.tsx`) tracks sessions and exposes helpers.
- Protected routes combine `ProtectedRoute` and role-based guards (`AdminRouteGuard`, etc.) under `src/components/layouts/` to gate access in `App.tsx`.

### Third-Party Libraries

- `xlsx`: Parse and generate Excel reports, primarily inside Edge Functions (e.g., `upload-comprehensive-report`).
- `sonner`: Provide toast notifications via `<Toaster />` in `App.tsx` and the `useToast` hook.
- `framer-motion`: Handle complex animations and transitions when Tailwind utilities are insufficient.

### Deployment

- Target platform: Vercel.
- Build command: `npm run build`; output: `dist/`.
- Configure environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, plus any future secrets) in the Vercel dashboard.
- Routing: `vercel.json` contains rewrites to support client-side routing.

## 4. API Usage Summary

- Supabase Auth manages sessions via `supabase.auth.*` helpers (`signInWithPassword`, `signUp`, `signOut`, `getSession`, `onAuthStateChange`).
- REST interactions go through Supabase's auto-generated endpoints (e.g., `/rest/v1/profiles`, `/rest/v1/thumbnail_banners`). Define domain hooks (`useUsers`, `useThumbnails`, etc.) that wrap these queries and respect RLS.
- Supabase Edge Functions cover privileged mutations such as user management and bulk report ingestion.
- Use TanStack Query for both fetching (`useQuery`) and mutations (`useMutation`), with cache invalidation hooks to keep views current.
- Handle errors consistently: surface client errors via TanStack Query state and show user-facing feedback with Sonner toasts. Edge Functions should respond with structured JSON and appropriate status codes.

## 5. Quick Reference

- **Dev commands**: `npm run dev`, `npm run lint`, `npm run build`.
- **Key paths**: `src/components/ui/` (base UI layer), `src/hooks/` (data access), `src/integrations/supabase/client.ts` (backend entry), `supabase/functions/` (server logic).
- **Security reminders**: Never commit `.env.local`; rotate keys if exposure is suspected.
- **When unsure**: Start here, then inspect the referenced folder for feature-specific context.

