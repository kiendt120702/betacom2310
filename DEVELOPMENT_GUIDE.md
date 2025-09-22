# Development Guide

This guide provides conventions and best practices for developers contributing to the Slide Show Nexus Admin project. Following these guidelines will help maintain code quality, consistency, and performance.

## Getting Started

1.  **Clone the repository.**
2.  **Install dependencies**: `npm install`
3.  **Set up environment variables**: Create a `.env.local` file by copying `.env.example` and fill in your Supabase credentials.
4.  **Run the development server**: `npm run dev`

## Code Quality & Conventions

-   **TypeScript**: Use TypeScript for all new code. Adhere to strict type checking and avoid using `any` whenever possible.
-   **ESLint**: The project is configured with ESLint for code quality. Run `npm run lint` to check for issues.
-   **Component Structure**:
    -   Keep components small and focused on a single responsibility.
    -   Use functional components with React Hooks.
    -   Separate complex business logic into custom hooks (`src/hooks/`).
-   **Styling**:
    -   Use **Tailwind CSS utility classes** for all styling.
    -   Avoid inline styles and separate CSS files unless absolutely necessary.
    -   Define new colors or theme extensions in `tailwind.config.ts`.

## State Management

-   **Server State**: Use **TanStack Query (`@tanstack/react-query`)** for all data fetched from Supabase.
    -   Create a custom hook (e.g., `useUsers`) for each data domain.
    -   Use mutation hooks for creating, updating, and deleting data.
    -   Leverage query keys to manage caching and invalidation.
-   **UI State**: Use React's built-in `useState` and `useReducer` hooks for local component state. For global UI state (e.g., theme), use React Context (`src/contexts/`).

## Performance Best Practices

-   **Memoization**: Use `React.memo`, `useMemo`, and `useCallback` to prevent unnecessary re-renders, especially in complex components or lists.
-   **Lazy Loading**: All page components should be lazy-loaded using `React.lazy()` in `src/App.tsx` to enable code-splitting.
-   **Bundle Size**: Be mindful of adding new dependencies. Use tools like `vite-bundle-analyzer` to inspect the bundle size if needed.
-   **Image Optimization**: Use the `LazyImage` component for all images to ensure lazy loading and placeholder states.

## Security

-   **Never commit sensitive information** (e.g., API keys, secrets) to the repository. Use environment variables.
-   **Sanitize all user input**, especially content that will be rendered as HTML, to prevent XSS attacks. Use libraries like `DOMPurify` where necessary.
-   **Respect Row Level Security (RLS)**: All Supabase queries from the client-side are subject to RLS policies. Ensure policies are correctly configured for any new tables or queries.
-   **Use Edge Functions** for operations that require elevated privileges (e.g., creating users, accessing sensitive data).

## Submitting Changes

1.  **Branching**: Create a new feature branch from `main` for your changes (e.g., `feature/add-analytics-chart`).
2.  **Commits**: Write clear and concise commit messages.
3.  **Pull Request**: Open a pull request against the `main` branch. Provide a clear description of the changes and any relevant context.
4.  **Review**: Ensure all automated checks (linting, building) pass and get a code review before merging.