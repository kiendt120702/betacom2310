# AI Development Rules for Lovable Project

This document outlines the core technologies used in this project and provides clear guidelines on which libraries and frameworks to use for specific functionalities. Adhering to these rules ensures consistency, maintainability, and optimal performance.

## Tech Stack Overview

*   **Frontend Framework:** React.js
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **UI Component Library:** shadcn/ui (built on Radix UI)
*   **Styling:** Tailwind CSS
*   **Routing:** React Router DOM
*   **Data Fetching & State Management:** React Query
*   **Backend-as-a-Service (BaaS):** Supabase (for authentication, database, and storage)
*   **Icons:** Lucide React
*   **Form Management & Validation:** React Hook Form with Zod

## Library Usage Rules

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **UI Components:** Always use components from `shadcn/ui`. If a required component is not available in `src/components/ui`, create a new, small, and focused component in `src/components/` that adheres to shadcn/ui's design principles and Tailwind CSS. Do not modify existing `src/components/ui` files.
*   **Styling:** All styling must be done using **Tailwind CSS** classes. Avoid inline styles or separate CSS files unless absolutely necessary for global styles (e.g., `src/index.css`).
*   **Icons:** Use icons exclusively from the `lucide-react` library.
*   **Routing:** Manage all application routes within `src/App.tsx` using `react-router-dom`.
*   **Data Fetching & Mutations:** For all server-side data interactions (fetching, adding, updating, deleting), use **React Query** (`@tanstack/react-query`). Create custom hooks in `src/hooks/` for reusable data logic.
*   **Forms:** Implement forms using **React Hook Form** for state management and validation. Use **Zod** for schema-based form validation.
*   **Notifications:** For user feedback (e.g., success messages, errors), use the `sonner` library for toast notifications.
*   **Supabase:** Interact with Supabase services (Auth, Database, Storage, Functions) using the `@supabase/supabase-js` client, imported from `src/integrations/supabase/client.ts`.
*   **File Structure:**
    *   Pages should reside in `src/pages/`.
    *   Reusable UI components should be in `src/components/`.
    *   Custom React hooks should be in `src/hooks/`.
    *   Supabase integration files are in `src/integrations/supabase/`.
    *   Always create a new file for each new component or hook. Keep files small and focused.