# World Class Aid - Developer Onboarding Guide

Version: March 18, 2026

## 1) Project Setup

Prerequisites:
- Node.js LTS
- npm
- Supabase project access

Install and run:
1. npm install
2. Create .env with:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
3. npm run dev

## 2) Repository Structure

Main folders:
- src/: frontend code
- src/pages/: route-level pages
- src/pages/admin/: admin modules
- src/pages/partner/: partner modules
- src/components/: reusable UI + business components
- src/hooks/: auth/data hooks
- src/integrations/supabase/: typed client and DB types
- supabase/migrations/: schema and RLS history
- supabase/functions/: edge functions

## 3) Architecture Basics

Frontend stack:
- React + TypeScript + Vite
- React Router for routes
- TanStack Query for table data caching

Backend stack:
- Supabase Auth, Postgres, Storage, Realtime
- RLS policies for authorization

## 4) Authentication and Roles

Core files:
- src/hooks/useAuth.tsx
- src/components/ProtectedRoute.tsx

Key behavior:
- Session persists in localStorage
- Roles fetched from user_roles
- ProtectedRoute enforces required role for /admin and /partner-dashboard

## 5) Data Access Patterns

Two patterns are used:
- Supabase SDK (preferred for most CRUD and subscriptions)
- REST fetch to /rest/v1 (used in selected flows)

Important hook:
- src/hooks/useSupabaseData.ts

Includes generic table operations:
- useTableData
- useInsertRow
- useUpdateRow
- useDeleteRow

## 6) Dashboard Modules

Partner modules:
- Overview
- Students (create + doc upload)
- Marketing
- Notifications
- Profile

Admin modules:
- Dashboard overview
- Content CRUD modules
- Partner approval
- Student status operations
- Leads management
- Notification center

## 7) Database Essentials

Critical tables:
- user_roles, profiles
- partner_registrations, students, partner_notifications
- leads, intake_reminders
- countries, universities, courses, accommodations, scholarships, language_centers, blogs, events
- admin_notifications, admin_notification_reads

Auth function:
- has_role(_user_id, _role)

## 8) Storage Buckets

- partner-documents
- student-documents

Usage:
- Partner registration docs
- Partner avatar
- Student application documents

## 9) Edge Functions

- notify-new-lead
- notify-partner
- notify-student-status
- send-intake-reminders

These handle outbound email and reminder automation.

## 10) Local Development Workflow

Recommended flow:
1. Pull latest branch.
2. Run app and validate target flow manually.
3. Implement in smallest safe change set.
4. Validate role-specific impacts (public/partner/admin).
5. Run tests/lint where applicable.
6. Update docs when behavior changes.

## 11) Safe Change Checklist

Before merge:
- Routes still guarded by role as expected.
- RLS assumptions still valid for modified tables.
- No hardcoded secrets or privileged keys in client code.
- Mutations show clear success/error states in UI.
- New buttons/actions have user feedback and fail-safe behavior.

## 12) First Tasks for New Developers

1. Trace login -> role fetch -> protected route flow.
2. Add one field to an admin CRUD module end-to-end.
3. Add one partner notification event.
4. Document the change in PROJECT_DOCUMENTATION.

## 13) Common Pitfalls

- Forgetting RLS implications when adding new table operations.
- Mixing SDK and REST in same flow without consistent error handling.
- Shipping UI actions without persistence (or vice versa).
- Missing role checks when adding new private routes.
