# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Slide Show Nexus Admin is a comprehensive e-commerce management platform built with React, TypeScript, and Supabase. The system specializes in managing thumbnail assets, employee training programs, sales analytics, and multi-platform e-commerce operations (Shopee and TikTok).

**Key Features:**
- **Thumbnail Management**: Upload, approval, categorization, and performance tracking of product thumbnails
- **Training System**: Comprehensive learning management with video courses, exercises, and progress tracking
- **Sales Analytics**: Advanced reporting and dashboard system for revenue and performance analysis
- **Personnel Management**: Hierarchical user management with role-based access control
- **Multi-Platform Support**: Shopee and TikTok Shop integration
- **Fast Delivery Tools**: Logistics optimization and delivery performance tracking

## Architecture

### Frontend Stack
- **React 18**: Modern functional components with hooks and Suspense
- **TypeScript**: Full type safety with strict configuration
- **Vite**: Fast development server and optimized production builds
- **Tailwind CSS + shadcn/ui**: Modern design system with accessible components
- **TanStack Query**: Server state management with aggressive caching strategies
- **React Hook Form + Zod**: Optimized form handling with runtime validation

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)**: Database-level security policies
- **Real-time Subscriptions**: Live data updates via WebSocket
- **Edge Functions**: Server-side logic for complex operations
- **Storage**: File upload system for images and videos

### Key Components Structure
```
src/
├── components/
│   ├── ui/              # Base shadcn/ui components
│   ├── admin/           # Admin panel components
│   ├── dashboard/       # Analytics and reporting components  
│   ├── layouts/         # Route guards and layout components
│   ├── thumbnail/       # Thumbnail management components
│   ├── training/        # Learning management components
│   └── forms/           # Reusable form components
├── hooks/               # Custom hooks for business logic
├── pages/               # Route-level components
├── integrations/supabase/ # Database types and client configuration
└── lib/                 # Utility functions and helpers
```

## Authentication & Authorization

### Role-Based Access Control
- **admin**: Full system access and user management
- **manager**: Team management and comprehensive reporting access
- **leader**: Personnel management and team performance tracking
- **employee**: Basic access to assigned features
- **trainer**: Training content management and student progress monitoring

### Route Protection
- `ProtectedRoute`: Requires authentication
- `AdminRouteGuard`: Admin-only routes
- `EduRouteGuard`: Training system access
- `DashboardRouteGuard`: Analytics dashboard access
- `EduShopeeRouteGuard`: Shopee-specific training access
- `TrainingAdminRouteGuard`: Training management access

## Database Schema

### Core Tables
- `profiles`: User management with role hierarchy
- `shops`: Multi-shop management system
- `thumbnails`: Image asset management with approval workflow  
- `training_courses`: Learning content structure
- `comprehensive_reports`: Sales and performance analytics data
- `exercises` & `submissions`: Training assessment system

### Key Relationships
- Hierarchical user management (manager_id references)
- Shop-to-personnel assignments
- Training progress tracking per user
- Thumbnail categorization and approval workflow

## State Management

### Data Fetching Strategy
- **TanStack Query**: Server state with 10-minute stale time, 30-minute GC time
- **Custom Hooks**: Business logic abstraction (e.g., `useThumbnails`, `useTraining`)
- **Optimistic Updates**: Immediate UI updates with rollback on error
- **Background Refetching**: Disabled for performance optimization

### Performance Optimizations
- Lazy loading for all route components
- Image lazy loading with skeleton placeholders
- Query deduplication and caching
- Code splitting with React.lazy()

## UI/UX Patterns

### Design System
- **Component Library**: shadcn/ui built on Radix UI primitives
- **Theming**: CSS custom properties with dark/light mode support
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Accessibility**: WCAG-compliant components

### Common Patterns
- Card-based layouts for data display
- Modal/Dialog system for actions
- Toast notifications for user feedback
- Loading states with skeleton UI
- Error boundaries for graceful error handling

## Development Practices

### Code Quality
- **TypeScript**: Strict mode with comprehensive type coverage
- **ESLint**: Code quality and consistency enforcement
- **Component Structure**: Functional components with custom hooks
- **Error Handling**: Comprehensive error boundaries and user feedback

### File Conventions
- PascalCase for component files
- camelCase for utility functions and hooks
- Folder structure by feature/domain
- Index files for clean imports

## Testing Approach

When adding tests:
- Unit tests for utility functions and hooks
- Component tests for UI components
- Integration tests for data flows
- End-to-end tests for critical user journeys

## Performance Considerations

### Optimization Strategies
- React.memo for expensive component re-renders
- useMemo and useCallback for expensive computations
- Virtual scrolling for large lists
- Image optimization and CDN usage
- Query caching with TanStack Query

### Bundle Size Management
- Tree shaking with Vite
- Dynamic imports for route-level code splitting
- Selective library imports
- Bundle analysis tools integration

## Security Best Practices

### Data Protection
- Row Level Security (RLS) policies in Supabase
- JWT token validation on all requests
- Input sanitization and validation
- File upload restrictions and scanning
- XSS protection with proper escaping

### Access Control
- Route-level authorization checks
- Component-level permission validation
- API endpoint protection
- Sensitive data encryption

## Development Rules

### General Principles
- Update existing docs (Markdown files) in `./docs` directory before any code refactoring
- Add new docs (Markdown files) to `./docs` directory after new feature implementation (avoid duplicated docs)
- Use `context7` MCP tools for documentation of plugins/packages
- Use `senera` MCP tools for semantic retrieval and editing capabilities
- Use `psql` bash command to query database for debugging purposes
- For comprehensive codebase overview, use `repomix` command and read the output summary file

### Environment Setup
- Use Docker Compose for development environment when available
- Ensure all environment variables are properly configured
- Use Supabase local development setup when possible

### Code Quality Guidelines
- **Linting**: Don't be overly strict on code linting and formatting
- **Functionality First**: Prioritize functionality and readability over strict style enforcement
- **Reasonable Standards**: Use code quality standards that enhance developer productivity
- **Style Flexibility**: Allow minor style variations when they improve code clarity

### Pre-commit/Push Requirements
- Run `npm run lint` before commit (if available)
- Run `npm run build` before push to ensure build success
- Run `npm run typecheck` before push to catch TypeScript errors
- Keep commits focused on actual code changes
- **NEVER** commit confidential information (env files, API keys, database credentials, etc.)

### AI Tool Attribution Policy
- **NEVER** automatically add AI attribution signatures such as:
  - "🤖 Generated with [Claude Code]"
  - "Co-Authored-By: Claude noreply@anthropic.com"  
  - Any other AI tool attribution or signature
- Create clean, professional commit messages without AI references
- Use conventional commit format when possible (feat:, fix:, docs:, etc.)

### Development Workflow
- Follow existing code patterns and conventions
- Use TypeScript strictly with proper type definitions
- Implement proper error handling and user feedback
- Test thoroughly before submitting changes
- Document complex business logic in code comments
- Follow React best practices for component structure and hooks