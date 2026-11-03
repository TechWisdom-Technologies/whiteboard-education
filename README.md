# Whiteboard Education

> Comprehensive educational advisory and student admissions platform connecting international students, partner agencies, and university admissions teams for higher education in Malaysia.

---

## 🚀 Overview

**Whiteboard Education** is an all-in-one platform designed to streamline international student recruitment for Malaysian universities and educational institutions. It replaces fragmented communication across emails, chats, and spreadsheets with a unified system featuring:

* **Public Portal**: Explore Malaysian universities, academic programs, city guides, student accommodations, and tuition estimates. Includes an interactive Eligibility Wizard, program comparison tools, and a dynamic multi-currency converter.
* **B2B Partner Portal**: Dedicated agency hub allowing verified education consultants and agencies to manage prospective students, submit university applications, track statuses across a 9-stage admissions pipeline, and access institutional marketing collateral.
* **Admin Dashboard**: Operational command center for admissions teams to manage leads, review agency registrations, oversee student applications, manage institutional partnerships, and publish content (universities, courses, accommodations, blogs, and events).

---

## 🏗️ Tech Stack

### Frontend
* **Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vitejs.dev/) with `@vitejs/plugin-react-swc`
* **Routing**: [React Router v6](https://reactrouter.com/) (role-based route guarding via `ProtectedRoute`)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives), [Lucide React](https://lucide.dev/)
* **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query)
* **Form Handling**: React Hook Form + Zod validation
* **Data Visualization & Media**: Recharts, Embla Carousel, React Quill, Leaflet (interactive campus maps)

### Backend & Cloud
* **BaaS**: [Supabase](https://supabase.com/)
  * **Authentication**: Email/password auth with Role-Based Access Control (RBAC: `admin`, `partner`, `user`)
  * **Database**: PostgreSQL with Row-Level Security (RLS) policies
  * **Storage**: Supabase Storage buckets for student documents and media
  * **Serverless**: Supabase Edge Functions (Deno runtime) for automated email notifications and intake reminders
* **Optional Local Proxy**: Express + Node.js PostgreSQL pool proxy (`server.js`)

---

## 📁 Repository Structure

```
.
├── public/                  # Static assets, logos, and favicon
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin/           # Admin dashboard widgets & dialogs
│   │   ├── partner/         # Partner portal tables & submission forms
│   │   ├── public/          # Landing sections, search filters, and banners
│   │   ├── student/         # Student portal & chat components
│   │   └── ui/              # shadcn/ui atomic components
│   ├── config/              # Application constants & status flow configurations
│   ├── contexts/            # Context providers (CurrencyContext, CourseCompareContext)
│   ├── data/                # Static datasets and lookup values
│   ├── hooks/               # Custom hooks (useAuth, useSupabaseData, use-toast, etc.)
│   ├── integrations/        # Supabase client (`client.ts`) and auto-generated database `types.ts`
│   ├── lib/                 # Utility helpers (formatting, class mergers)
│   ├── pages/               # Route page components
│   │   ├── admin/           # Admin dashboard views (/admin/*)
│   │   ├── partner/         # Partner portal views (/partner/*)
│   │   └── *.tsx            # Public pages (Courses, Universities, CityHub, Compare, etc.)
│   ├── test/                # Vitest unit test suite and environment setup
│   ├── App.tsx              # App entry point, routing tree, and providers
│   └── main.tsx             # DOM initialization
├── supabase/
│   ├── functions/           # Supabase Edge Functions (Deno)
│   └── migrations/          # Version-controlled SQL schema and migrations
├── scripts/                 # Utility scripts (data scrapers, bulk imports, database sync)
├── server.js                # Optional local Express/PostgreSQL API proxy
├── vite.config.ts           # Vite configuration (server port: 8080)
├── vitest.config.ts         # Vitest configuration
└── package.json
```

---

## ⚙️ Setup & Local Development

### Prerequisites

* [Node.js](https://nodejs.org/) (v18.x or later recommended)
* `npm`, `pnpm`, or `yarn`
* A [Supabase](https://supabase.com/) project (or local Supabase instance)

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd whiteboard-education
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Optional: Local API / PostgreSQL proxy (only if running npm run server)
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/whiteboard_db
```

> ⚠️ **Important:** Ensure the key variable is named `VITE_SUPABASE_PUBLISHABLE_KEY` (or your Supabase anon public key) as expected by the client. Do not commit production secret keys to version control.

### 4. Start the Development Server

```bash
npm run dev
```

The application will be accessible at:
```
http://localhost:8080
```

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port `8080` with HMR |
| `npm run build` | Compiles TypeScript and creates an optimized production build in `dist/` |
| `npm run build:dev` | Compiles a build using development mode |
| `npm run preview` | Serves the locally built `dist/` directory for previewing |
| `npm run lint` | Runs ESLint across all `.ts` and `.tsx` source files |
| `npm run test` | Executes Vitest test suite once (`vitest run`) |
| `npm run test:watch` | Runs Vitest in interactive watch mode for active development |
| `npm run server` | Starts the optional local Express + PostgreSQL API proxy (`server.js`) via Nodemon |

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) with JSDOM and React Testing Library.

* Run the test suite:
  ```bash
  npm run test
  ```
* Run tests with watch mode:
  ```bash
  npm run test:watch
  ```

Test files are located in `src/test/` (e.g., [`src/test/example.test.ts`](src/test/example.test.ts)) with configuration in [`vitest.config.ts`](vitest.config.ts).

---

## 🔌 Supabase Architecture

### Client Initialization
The Supabase client is initialized in [`src/integrations/supabase/client.ts`](src/integrations/supabase/client.ts) and consumes strong TypeScript types defined in `types.ts`. Custom hooks like [`useAuth.tsx`](src/hooks/useAuth.tsx) and [`useSupabaseData.ts`](src/hooks/useSupabaseData.ts) wrap data operations and role checks.

### Role-Based Access Control (RBAC)
User authorization is governed by the `user_roles` table and database Row-Level Security (RLS):
* `admin`: Complete read/write access to CMS, lead pipelines, partners, and system settings.
* `partner`: Restricted to assigned students, submissions, partner profile, and marketing resources.
* `user`: Standard authenticated accounts.

### 9-Stage Application Lifecycle
Partner student applications progress through standardized stages defined in [`src/config/statusFlow.ts`](src/config/statusFlow.ts):
1. `lead` - Initial inquiry
2. `application_draft` - Draft application by agency
3. `documents_pending` - Awaiting required documents
4. `application_submitted_to_wb` - Submitted to Whiteboard Education
5. `application_in_review_by_wb` - Under internal review
6. `submitted_to_university` - Transmitted to the Malaysian university
7. `offer_issued` - Conditional / Unconditional Offer Letter received
8. `visa_processing` - EMGS / Student Visa approval in progress
9. `enrolled` - Successfully enrolled and arrived in Malaysia

### Edge Functions
Serverless edge functions located in `supabase/functions/`:
* `notify-new-lead`: Triggers alerts on newly received student inquiries.
* `notify-partner`: Dispatches partner status alerts.
* `notify-student-status`: Sends automated updates when an application moves through stages.
* `send-intake-reminders`: Periodic automated reminders for upcoming university intake deadlines.

Deploy an edge function:
```bash
supabase functions deploy <function-name>
```

### Database Migrations
Database schemas, RLS rules, and triggers are tracked in `supabase/migrations/`. To apply migrations:
```bash
supabase db push
```

---

## 📦 Deployment

### Static Frontend Deployment
1. Build the production bundle:
   ```bash
   npm run build
   ```
2. Deploy the `dist/` folder to any static hosting provider (e.g., Netlify, Vercel, Cloudflare Pages).
3. Ensure single-page application (SPA) rewrites are configured so all route requests fall back to `/index.html`.
4. Configure environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) in your hosting provider's dashboard.

---

## 🤝 Contributing

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your modifications, adhering to existing code conventions.
3. Verify that linting and tests pass:
   ```bash
   npm run lint
   npm run test
   ```
4. Commit your changes with clear, descriptive commit messages and open a Pull Request.

---

## 📄 License

This project is proprietary and confidential to **Whiteboard Education**. All rights reserved.
