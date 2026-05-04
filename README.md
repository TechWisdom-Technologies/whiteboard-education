# World Class Aid

A comprehensive educational services platform built with React, TypeScript, and Supabase. The application provides a variety of pages and utilities for students, partners, and administrators to manage courses, events, scholarships, visa guidance, and more.

---

## 🚀 Project Overview

- **Framework**: Vite + React (TSX)
- **UI**: Tailwind CSS with shadcn-ui components
- **State & Hooks**: Custom hooks under `src/hooks`
- **Backend**: Supabase (authentication, database, functions, migrations)
- **Deployment**: Managed through Netlify, Vercel, or any static hosting provider

This repository powers the front-end of the World Class Aid platform. Supabase integration provides authentication, data storage, and serverless functions for email notifications and reminders.

---

## 📁 Repository Structure

```
.
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable React components
│   ├── data/                # Mock data for tests/dev
│   ├── hooks/               # Custom hooks (auth, supabase, toast, mobile)
│   ├── integrations/        # Supabase configuration
│   ├── lib/                 # Utility functions
│   ├── pages/               # Route components grouped by feature
│   │   ├── admin/           # Admin dashboard pages
│   │   ├── partner/         # Partner-specific pages
│   │   └── public/          # Public-facing pages
│   └── App.tsx              # Root component
├── supabase/                # Database migrations and edge functions
│   ├── functions/           # Serverless functions
│   └── migrations/          # SQL migrations
├── test/                    # Vitest configuration and examples
├── package.json
├── tsconfig*.json           # TypeScript configs
└── vite.config.ts
```

> 📌 **Tip:** Use the `src/pages` directory as the primary reference for available routes and application structure.

---

## 🛠️ Setup & Local Development

1. **Clone the repository**
    ```bash
    git clone <YOUR_GIT_URL>
    cd world-class-aid
    ```

2. **Install dependencies**
    ```bash
    npm install
    # or using pnpm/yarn if preferred
    ```

3. **Configure environment**

   Create a `.env` file at the root with the following variables (example values):

   ```env
   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
   VITE_SUPABASE_ANON_KEY=public-anon-key
   ```

   > ⚠️ Do NOT commit your production keys. Use a secrets manager or CI variables.

4. **Run the development server**
    ```bash
    npm run dev
    ```

   The app will be available at `http://localhost:5173` by default.

5. **Supabase local development**

   - Use the [Supabase CLI](https://supabase.com/docs/guides/cli) to run a local instance if you need to test migrations or functions.
   - Migrations are stored under `supabase/migrations` and can be applied with `supabase db push`.

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) for unit tests.

- Run all tests:
  ```bash
  npm run test
  ```

- Watch mode for development:
  ```bash
  npm run test:watch
  ```

There is an example test file at `test/example.test.ts` and testing setup in `test/setup.ts`.

---

## 🔌 Supabase Integration

### Configuration

Supabase is initialized in `src/integrations/supabase/index.ts` and used by custom hooks in `src/hooks/useSupabaseData.tsx`, `useAuth.tsx`, etc.

Environment variables prefixed with `VITE_` are forwarded to the client.

### Serverless Functions

Edge functions live under `supabase/functions/` and include:

- `notify-new-lead`: Alerts on new leads
- `notify-partner`: Partner notifications
- `notify-student-status`: Student status updates
- `send-intake-reminders`: Automated reminders

Deploy these via the Supabase CLI using `supabase functions deploy <name>`.

### Migrations

Migrations are automatically generated and stored under `supabase/migrations/`. Apply them with:

```bash
supabase db push
```

---

## 📦 Deployment

### Via Netlify

1. Build the project: `npm run build`
2. Generate API keys from Supabase dashboard
3. Deploy to Netlify, Vercel, or your preferred hosting platform
4. Add environment variables in hosting platform settings

### Manual Deploy

Build the static assets and deploy anywhere that can serve HTML files:

```bash
npm run build
# then upload the contents of dist/ to your host
```

Common targets include Vercel, Netlify, GitHub Pages, etc.

---

## 🙌 Contributing

1. Fork the repository and create a new branch for your feature or fix.
2. Run `npm install` and make sure tests pass locally.
3. Add or update tests as needed.
4. Submit a pull request describing your changes.

Please follow existing code style and conventions. We use ESLint and Prettier; you can run `npm run lint`.

---

## 📘 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **React**: https://reactjs.org
- **Vite**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vitest**: https://vitest.dev

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

_Feel free to reach out if you need help understanding the codebase or contributing. Happy hacking!_
