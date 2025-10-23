# Slide Show Nexus Admin

Slide Show Nexus Admin is a React 18 + Vite + TypeScript dashboard for managing Betacom’s internal operations (users, teams, shops, training progress, sales analytics, etc.).  
The project now runs entirely on an in-memory mock backend located in `src/integrations/mock`, so it works out-of-the-box without any external services.

## Key Features

- **Authentication & Profile:** mock sign-in with seeded accounts and editable profile information.
- **User Management:** filterable table with CRUD, role and team assignment, manager relationships.
- **Team Management:** create/update/delete departments used across the admin screens.
- **Sales & Shop Dashboards:** mock analytics for Shopee/TikTok revenue, daily reports, and KPI tracking.
- **Learning Progress:** mock hooks for training progress tracking.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Tailwind + shadcn/ui.
- **State/Data:** TanStack Query with locally mocked services (`src/integrations/mock`).
- **Forms & UX:** React Hook Form + Zod, TipTap, Recharts, Radix primitives.

## Project Structure (excerpt)

```
src/
  components/          Shared UI (admin widgets, forms, layout, etc.)
  hooks/               Data hooks (now powered by mock API)
  integrations/
    mock/              In-memory datasets and API surface
  pages/               Route-level views
  lib/                 Utilities/helpers
```

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and use one of the seeded credentials, e.g.:

| Email                         | Password     | Role          |
|------------------------------|--------------|---------------|
| `admin@betacom.vn`           | `admin123`   | admin         |
| `leader.sales@betacom.vn`    | `password123`| leader        |
| `hoa.nguyen@betacom.vn`      | `password123`| chuyên viên   |

(See `src/integrations/mock/database.ts` for the full list.)

## Development Notes

- All CRUD hooks (`useUsers`, `useTeams`, `useShops`, etc.) now talk to the mock API.  
- Supabase has been fully removed; use the mock API directly for all data flows.
- Image uploads are simulated via Base64 data URLs—no external storage is required.

## Building

```bash
npm run build
```

The production build is output to `dist/`. Deploy it to any static host if needed.

## Contributing

- Run `npm run lint` to check code style (warning: existing issues are still being triaged).
- Prefer TypeScript, functional components, and React Query for data flows.

Enjoy! 🎉
