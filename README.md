# DIUK Frontend

Next.js frontend for DIUK Solution. This app signs users in with Supabase Auth and will call the existing Go API.

## Requirements

- Node.js 20+
- npm
- A Supabase project with email/password auth (Google optional)

## Setup

```bash
cp .env.local.example .env.local
```

Fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon / publishable key only)
- `NEXT_PUBLIC_API_URL` (local Go API, usually `http://localhost:8080`)

Never put the Supabase service-role key in this project.

In the Supabase dashboard, add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/**`

If Google sign-in is enabled in Supabase, the login page uses it.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/login`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```
