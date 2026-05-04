# World Class Aid - Full Project Documentation

Version: March 18, 2026

## 1) What This Project Is

World Class Aid is a multi-role education platform for international student recruitment and application operations.

It combines:
- A public website for students and parents to discover study options
- A partner portal for agencies to submit and track student applications
- An admin dashboard for operations, approvals, content management, and lead handling
- A Supabase backend for auth, data, storage, RLS, and automation

Primary goals:
- Convert website visitors into leads/applications
- Help agencies manage student submissions and documents
- Give admins central control of content and operational pipelines

## 2) Why This Application Matters

Business value:
- Centralized funnel from discovery to enrollment
- Reduced manual coordination across email, spreadsheets, and chat
- Better visibility for both partners and internal admissions teams

Operational value:
- Role-based access to prevent cross-role misuse
- Real-time status updates for partner confidence
- Structured data model for courses, universities, events, and leads

Growth value:
- Content pages and tools increase organic acquisition
- Partner channel creates scalable B2B admissions pipeline
- Notification and reminder mechanisms improve conversion speed

## 3) Who Uses The System

Roles in the app:
- Public/visitor: can browse and submit leads/reminders
- User (basic authenticated): can log in, but no dashboard role privileges unless role exists
- Partner: can access partner dashboard features
- Admin: can access admin dashboard and manage operations/content

Role enum in DB:
- app_role: admin | partner | user

## 4) Tech Stack and Runtime

Frontend:
- Vite + React + TypeScript
- Tailwind CSS + shadcn-ui components
- React Router for route-based UI
- TanStack Query for table data fetching/caching

Backend:
- Supabase Auth, Database (Postgres), Storage, Realtime
- RLS policies for per-role/per-owner access control
- Supabase Edge Functions for notification/reminder emails

Other:
- Sonner + custom toast utilities for UI feedback

## 5) High-Level Architecture

Flow summary:
1. Frontend authenticates via Supabase Auth.
2. Frontend fetches role(s) from user_roles.
3. ProtectedRoute guards admin/partner route trees by role.
4. Frontend reads/writes data via Supabase SDK and REST endpoints.
5. RLS policies enforce DB-side authorization.
6. Triggers + edge functions send outbound notifications.

## 6) Route and Section Map

### Public Routes
- /
- /login
- /destinations/malaysia
- /destinations/malaysia/:citySlug
- /universities
- /universities/:universityId
- /courses
- /courses/:courseId
- /tools/calculator
- /tools/gpa-converter
- /eligibility
- /compare
- /scholarships
- /visa-guide
- /housing
- /events
- /language-prep
- /careers
- /alumni
- /pre-departure
- /help
- /blog
- /blog/:id
- /language-centers
- /language-centers/:id
- /partner

### Partner Routes (protected: partner)
- /partner-dashboard
- /partner-dashboard/students
- /partner-dashboard/marketing
- /partner-dashboard/notifications
- /partner-dashboard/profile

### Admin Routes (protected: admin)
- /admin
- /admin/countries
- /admin/universities
- /admin/courses
- /admin/accommodations
- /admin/scholarships
- /admin/language-centers
- /admin/blogs
- /admin/events
- /admin/partners
- /admin/students
- /admin/leads
- /admin/settings

### Legacy Redirects
Old paths are redirected to current structure (study-in-malaysia, countries, calculator, b2b, etc.).

## 7) Authentication, Session, Role Detection, and Route Blocking

### Login / Signup
- Login page supports Sign In and Sign Up tabs.
- Sign Up creates Supabase Auth user with display_name metadata and email confirmation flow.
- Sign In checks credentials, fetches roles, and redirects by role:
  - admin -> /admin
  - partner -> /partner-dashboard
  - fallback -> /

### Partner pending/rejected feedback
- If login fails, app checks latest partner_registrations row by email.
- If status is pending or rejected, UI displays contextual status alert instead of generic failure only.

### Session handling
Supabase client is configured with:
- storage: localStorage
- persistSession: true
- autoRefreshToken: true

AuthProvider behavior:
- Subscribes to onAuthStateChange
- Also calls getSession on mount
- Stores session and roles in context

### Role resolution
- Roles are fetched from user_roles via REST endpoint using access token.
- hasRole(role) checks whether role exists in current role array.

### Route protection and role blocking
- ProtectedRoute waits for auth loading completion.
- If no user -> Navigate to /login.
- If role missing -> Access Denied screen.
- If authorized -> renders route children.

This blocks cross-role dashboard access.

## 8) Public Website Features and Buttons

### 8.1 Global Navigation (MegaMenu)
Top desktop/mobile navigation includes:
- Home
- Destinations (Malaysia + city links)
- Universities
- Courses
- Language Centers
- Housing
- Tools dropdown:
  - AI Eligibility Test
  - Compare Universities
  - Cost Calculator
  - GPA Converter
  - Scholarships
  - Visa Guide
  - Events & Webinars
  - Blog
- For Agencies
- Auth actions: Log In / Free Consult
- Role shortcuts when logged in:
  - Admin Panel
  - Partner Dashboard
  - Sign Out

Mobile includes equivalent actions via sheet menu.

### 8.2 Homepage sections
Main homepage is assembled from reusable sections:
- HeroSection
- Quick Links cards
- ServicesGrid
- StatsBanner
- IntakeCalendar
- UniversitiesSection
- AccommodationsSection
- ResourcesSection
- TestimonialsSection
- BlogSection
- LeadBanner
- VideoExpertWidget

### 8.3 Public lead capture operations
There are multiple lead capture points:
1. Hero consultation modal (LeadCaptureModal)
2. University/course application modal (LeadCaptureModal)
3. Floating video expert widget (inserts into leads)
4. LeadBanner email capture (guide download UX)
5. Event registration form (UI toast only, no DB write in current implementation)

LeadCaptureModal inserts to leads with:
- full_name, email, phone, nationality
- interested_course, interested_university
- source
- status = new

### 8.4 Reminder operation
- IntakeCalendar cards have Set Reminder button.
- ReminderModal inserts into intake_reminders table.
- send-intake-reminders edge function can send periodic emails.

### 8.5 Search/filter/pagination tools for visitors
- University directory: search, city filter, clear filters, paginated listing
- Course directory: search, degree/university filters, clear filters, paginated listing
- Blog listing: pagination controls
- Compare page: choose universities, clear slots
- Eligibility wizard: multi-step next/back/reset flow
- Cost calculator + GPA converter: calculator-like utility interactions

### 8.6 WhatsApp and social
- Floating WhatsApp button in PublicFooter
- Social links in footer

## 9) Partner Registration Process (B2B)

Page: /partner

Registration form includes:
- Agency Name
- Contact Person
- Email
- Password
- Phone
- Country
- Annual Students
- Required NID upload
- Optional trade license upload
- Optional certificates upload array

Submission workflow:
1. Create auth user via supabase.auth.signUp.
2. Upload files to partner-documents storage bucket.
3. Insert partner_registrations row with status=pending.
4. Sign out the newly created account (must wait approval).
5. Show success toast.

Why this matters:
- Enforces onboarding quality and compliance checks.
- Prevents unverified partners from accessing operational tools.
- Protects student pipeline from unauthorized submissions.

## 10) Partner Dashboard - Full Capability Documentation

## 10.1 Partner Layout + Sidebar
Header actions:
- Back to Site
- Notification bell popover
- Sign Out

Sidebar modules:
- Overview
- Students
- Marketing Hub
- Notifications
- My Profile

Unread notification count is live-updated via realtime subscription.

## 10.2 Partner Overview
What it does:
- Fetches own students by partner_id = current user id
- Shows KPI cards:
  - Total Students
  - In Review
  - In Progress
  - Enrolled
- Shows pipeline grouped by status
- Shows recent students

## 10.3 Partner Students
Core operations:
- Add Student (full profile form)
- View Student details
- Upload/replace required documents
- Search student list

Add Student form fields include:
- Personal info: full name, email, phone, passport, nationality, DOB, gender
- Academic: institution, degree, GPA, IELTS
- Target: university, course, intake, degree level

Document operations:
- Upload to student-documents bucket
- Persist public URL into students row fields

Status visibility:
- Partners can see admin-updated status and admin notes
- Partners do not control status transitions in current design

## 10.4 Partner Marketing
Current behavior:
- Shows static marketing assets list
- Download buttons trigger success toast (no real file API currently)
- Referral link copy action via clipboard
- Dashboard metrics shown as static demo values

## 10.5 Partner Notifications
Capabilities:
- Read own notifications
- Filter by all/unread/type
- Mark one as read
- Mark all as read
- Realtime insert subscription for incoming notifications

Sources of notifications:
- Admin student status updates insert rows into partner_notifications

## 10.6 Partner Profile
Capabilities:
- View partner registration details
- Edit display name
- Upload avatar
- Save profile changes

Storage/DB behavior:
- Avatar stored in partner-documents bucket
- avatar_url saved in profiles table

## 11) Admin Dashboard - Full Capability Documentation

## 11.1 Admin Layout + Sidebar
Header actions:
- Back to Site
- Admin notification center
- Sign Out

Sidebar modules:
- Dashboard
- Countries
- Universities
- Courses
- Accommodations
- Scholarships
- Language Centers
- Blog Posts
- Events
- B2B Partners
- Students
- Leads
- Settings

## 11.2 Admin Overview dashboard
Displays:
- Total universities, courses, partners, pending partners
- Total students, enrolled count, blog posts, countries
- Recent students list with status badges
- Recent partner registrations with status badges

## 11.3 Content CRUD modules
Shared component: AdminCrudTable

Shared controls in each CRUD page:
- Add item button
- Search input
- Edit row action
- Delete row action with confirm dialog
- Save/Update in modal form

Supported field types in CRUD forms:
- text, number, textarea
- select
- relation selector
- tag input
- json_array editor
- json_object editor

Managed entities:
- countries
- universities
- courses
- accommodations
- scholarships
- language_centers
- blogs
- events

## 11.4 Admin Partners (approval workflow)
Capabilities:
- View all partner registrations
- Open detail dialog
- Review uploaded docs (NID/trade license/certificates)
- Set default commission percentage
- Write admin notes
- Approve or reject pending registration

Approve action:
- Updates partner_registrations status = approved
- Upserts user_roles with partner role

Reject action:
- Updates status = rejected with notes

## 11.5 Admin Students (application operations)
Capabilities:
- Search students
- Filter by partner and status
- Partner summary quick filters
- View full student profile and docs
- Inline preview docs (image/pdf/iframe)
- Download/open documents
- Change student status
- Add admin notes
- Save changes

When admin updates status:
- students row is patched
- partner_notifications entry is inserted for partner

## 11.6 Admin Leads
Capabilities:
- View all leads
- Status filter
- Update lead status via select dropdown
- Contact quick links (mailto/tel)

Lead status lifecycle in UI:
- new, contacted, qualified, converted, lost

## 11.7 Admin Notifications
Admin notification center supports:
- Unread count badge
- Mark one read/unread
- Mark all read/unread
- Click notification to navigate to related admin page

Notification sources:
- admin_notifications table (trigger-fed)
- fallback derived from leads/partner_registrations/students when needed

## 11.8 Admin Settings
Current implementation:
- General settings form UI only
- Save Changes button currently does not persist to DB

## 12) Detailed CRUD Matrix

Admin-managed content tables and typical operations:
- countries: create/read/update/delete
- universities: create/read/update/delete
- courses: create/read/update/delete
- accommodations: create/read/update/delete
- scholarships: create/read/update/delete
- language_centers: create/read/update/delete
- blogs: create/read/update/delete
- events: create/read/update/delete
- leads: read + status update
- partner_registrations: read + approve/reject workflow
- students: read + status/admin_notes update

Partner-managed operational tables:
- students: create/read/update own students (RLS constrained)
- student-documents storage: upload/replace own docs
- partner_notifications: read/update own notifications
- profiles: update own display/avatar

Public writes:
- leads insert
- intake_reminders insert
- partner_registrations insert

## 13) Database Structure (Supabase)

## 13.1 Core tables
Content/catalog:
- countries
- universities
- courses
- accommodations
- scholarships
- language_centers
- blogs
- events

Auth/identity/roles:
- profiles
- user_roles

Operations:
- leads
- intake_reminders
- partner_registrations
- students
- partner_notifications
- admin_notifications
- admin_notification_reads

## 13.2 Important relationships
Explicit foreign keys:
- universities.country_id -> countries.id
- courses.university_id -> universities.id
- scholarships.university_id -> universities.id
- partner_notifications.student_id -> students.id

Logical (app-level) links:
- students.partner_id stores auth user id of partner
- partner_registrations.user_id links registration to auth user

## 13.3 Role and authorization function
DB function:
- has_role(_user_id, _role)

Used heavily in RLS policies for admin/partner checks.

## 13.4 RLS policy model (summary)
Public read content tables:
- countries, universities, courses, accommodations, scholarships, language_centers, blogs, events

Admin content management:
- full management policies guarded by has_role(auth.uid(), 'admin')

Partner registration:
- insert allowed for public signup flow
- read own registration for owner
- admin manage policy for review actions

Students:
- partners can read/insert/update own students
- admins can manage all students

Notifications:
- partner_notifications: partners can read/update own; admin can manage
- admin_notifications: admins can read
- admin_notification_reads: admins can CRUD own read-state rows

Leads/reminders:
- leads: public insert; admin manage
- intake_reminders: public insert; admin manage

## 13.5 Storage buckets in use
- partner-documents
- student-documents

Used for:
- partner registration docs
- partner avatar (currently also in partner-documents)
- student application documents

## 14) Backend and Database Connection Details

Frontend connects using:
- Supabase JS client in src/integrations/supabase/client.ts
- Environment vars:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_PUBLISHABLE_KEY

Data access patterns:
- Supabase SDK for CRUD/mutations and realtime
- Direct REST calls to /rest/v1 in several modules when custom headers/token control is needed

Why this is good:
- Fast frontend integration
- RLS-enforced security at DB layer
- Realtime capability for notifications
- Strongly typed DB definitions from generated types.ts

## 15) Automation and Edge Functions

Deployed functions:
- notify-new-lead
- notify-partner
- notify-student-status
- send-intake-reminders

What they do:
- notify-new-lead: email admins when new lead arrives
- notify-partner: email agency after approval/rejection update
- notify-student-status: email partner when student status changes
- send-intake-reminders: send reminder emails to active subscribers

Trigger-based automations in migrations:
- on_new_lead_notify trigger calls notify-new-lead
- admin_notifications feed triggers for:
  - new leads
  - pending partner registrations
  - students entering document review

## 16) Process Flows End-to-End

## 16.1 Public visitor to lead
1. Visitor explores pages/tools.
2. Visitor submits consultation/application/reminder form.
3. Row inserted to leads or intake_reminders.
4. Admin receives feed/email notification.
5. Admin updates lead pipeline status in dashboard.

## 16.2 Partner onboarding and activation
1. Agency registers on /partner with required docs.
2. Account + pending registration created.
3. Admin reviews documents in /admin/partners.
4. Admin approves -> partner role granted in user_roles.
5. Partner logs in and accesses /partner-dashboard.

## 16.3 Student pipeline (partner + admin)
1. Partner creates student profile.
2. Partner uploads required docs.
3. Admin reviews student in /admin/students.
4. Admin updates status and notes.
5. Notification appears in partner notifications.
6. Partner tracks progress to enrollment.

## 17) Button and Operation Catalog (Practical)

Global actions:
- Log In, Sign Up, Sign Out
- Free Consult, Request a Call
- Download PDF guide
- Set Reminder

Partner core buttons:
- Add Student
- View student
- Upload/Replace each doc
- Copy referral link
- Download (marketing assets)
- Mark all read / mark read
- Save profile changes
- Sign Out

Admin core buttons:
- Add item
- Edit item
- Delete item
- Save/Update item
- View partner registration details
- Approve and grant partner access
- Reject registration
- Update student status + save changes
- Update lead status
- Mark admin notifications read/unread

Public directory/navigation buttons:
- Search
- Clear filters
- Pagination previous/next
- View details
- Apply now / Start application
- Register (events)

Note on "every button":
- Some buttons are generated per row/item by reusable components (for example AdminCrudTable actions), so the same operation appears many times in table rows.

## 18) Project Skeleton and Folder Structure

Top-level:
- src/: app code
- supabase/: migrations, edge functions, config
- public/: static files
- test/: Vitest setup and sample tests

Key frontend folders:
- src/pages: route-level pages
- src/pages/admin: admin dashboard pages
- src/pages/partner: partner dashboard pages
- src/components: reusable UI and business components
- src/hooks: auth/data/toast hooks
- src/integrations/supabase: client + generated DB types

## 19) Current Strengths

- Clear role-segregated dashboards
- Generic admin CRUD architecture for faster module expansion
- Good use of RLS for authorization boundaries
- Realtime notifications for partner/admin UX
- Strong route organization and modular page composition
- Typed Supabase integration

## 20) Current Limitations

Functional limitations:
- Some pages/features are placeholder or mostly static (ComingSoon and informational pages)
- Admin Settings save is currently UI-only
- Partner Marketing downloads/referral metrics are not fully backend-backed
- Event registration currently shows success toast but does not persist registration records
- Mixed data access styles (SDK + manual REST fetch) increase maintenance complexity

Security/architecture limitations:
- Some flows rely on public URL docs; stronger private document strategy could be considered
- Role fetching currently via client-side REST call from AuthProvider; can be optimized/centralized

Product limitations:
- No dedicated student self-service dashboard yet
- Limited analytics/BI visualization in admin
- No advanced partner commission engine UI yet (beyond default commission field)

## 21) Recommended Next Features

### Website-side enhancements
1. Persist event registrations into DB and send confirmation email.
2. Add SEO content governance workflow (publish/unpublish/versioning style).
3. Improve search with full-text filters and ranking.
4. Add richer conversion analytics dashboard for public funnels.
5. Add dynamic FAQ blocks by page with admin-managed content and schema validation.
6. Add multilingual content support (English + key regional languages) with locale-aware routing.
7. Add scholarship recommendation engine using profile + academic fit scoring.
8. Introduce saved comparison lists and shortlist favorites for universities/courses.
9. Add personalized homepage content based on visitor intent and recent activity.
10. Add chatbot handoff to counselor with lead enrichment from conversation context.
11. Implement server-side sitemap generation and structured data for all indexable pages.
12. Add progressive web app features for offline brochure viewing and quick actions.
13. Add social proof widgets (recent admits, partner highlights, testimonial rotation).
14. Add A/B testing framework for hero CTAs, forms, and conversion funnels.

### Partner-side enhancements
1. Real commission module per student with settlement tracking.
2. Bulk student import/export (CSV/XLSX).
3. SLA timers and checklist workflow per student stage.
4. Team-based partner sub-accounts and activity logs.
5. Add partner KPI dashboard with monthly funnel, conversion, and payout trend charts.
6. Add document completeness score and pre-submission validation checklist.
7. Add in-dashboard task management and reminders per student case.
8. Add automated missing-document nudges by email/WhatsApp templates.
9. Add partner-specific intake calendar filtered by active target universities.
10. Add role-based sub-permissions for partner team members (viewer/editor/manager).
11. Add partner-specific API/webhook endpoints for external CRM synchronization.
12. Add dispute workflow for commission adjustments with evidence attachments.
13. Add referral campaign manager with UTM tracking and conversion attribution.
14. Add live chat module for partner-to-admin operational escalations.

### Admin-side enhancements
1. Complete settings persistence with audit logs.
2. Add assignment queue for lead/student ownership by staff.
3. Add moderation workflow for blogs/events before publish.
4. Add document verification checklist and rejection reason templates.
5. Add admin SLA board for pending registrations, leads, and student reviews.
6. Add bulk actions for partner approvals, lead status updates, and student transitions.
7. Add configurable notification rules by event type, role, and urgency.
8. Add advanced search/filter across all admin modules with saved views.
9. Add internal comments and @mentions on students, leads, and partner records.
10. Add analytics suite for source performance, counselor productivity, and cycle times.
11. Add export center for scheduled CSV reports with secure delivery.
12. Add data quality monitor to flag duplicates, invalid fields, and stale records.
13. Add approval matrix for sensitive changes (commission updates, role grants, deletes).
14. Add admin playbooks and guided workflows for common operations.

### Platform/security enhancements
1. Consolidate API access style and error handling strategy.
2. Add stronger bucket access patterns with signed URLs where appropriate.
3. Add integration tests for key role-gated and RLS-critical flows.
4. Add explicit transactional handling for multi-step onboarding paths.
5. Introduce centralized input validation schemas shared across frontend and edge functions.
6. Add secret rotation policy and environment variable integrity checks in CI/CD.
7. Add row-level audit trails for sensitive table updates and role grants.
8. Add abuse protection on public endpoints (rate limits, bot checks, anomaly alerts).
9. Add observability stack (structured logs, traces, alerting, SLO dashboards).
10. Add backup verification drills and restore runbooks for Supabase datasets.
11. Add migration quality gates and rollback-safe release procedures.
12. Add signed webhook verification and idempotency for external integrations.
13. Add token/session hardening and suspicious-login detection workflows.
14. Add automated security scanning (dependency, SAST, and policy checks) in pipeline.

## 22) How To Use The System (Quick Start by Role)

Visitor:
1. Browse universities/courses/tools.
2. Use Apply/Consult forms.
3. Set reminders for intake deadlines.

Partner:
1. Register on /partner and wait for approval.
2. Log in after approval.
3. Add student profiles and upload documents.
4. Track status updates and notifications.

Admin:
1. Log in with admin role.
2. Review partner registrations first.
3. Manage students, statuses, and notes.
4. Keep content modules updated via CRUD pages.
5. Monitor and process leads.

## 23) Final Summary

This project is a solid foundation for a full admission operations platform with real role-based separation and extensible data architecture.

It already supports:
- Multi-role access control
- Partner onboarding and workflow
- Student application lifecycle handling
- Public lead generation
- Content management modules

With the recommended enhancements, it can evolve into an enterprise-grade admissions operating system for both B2C and B2B channels.
