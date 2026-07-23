# DealFactor

Real-estate discovery and analysis platform for residential investors and home buyers.
See [`WEBSITE_SPEC.md`](./WEBSITE_SPEC.md) for the full product specification and
[`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) for the approved,
milestone-by-milestone build plan.

This repository is a Next.js (App Router) + TypeScript + Tailwind CSS v4 project,
backed by Supabase (auth, database, storage).

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in real values (see "Environment
   variables" below). Until you do this, the app still runs, but sign-in/sign-up
   will fail since there's no real Supabase project behind it.

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Where it comes from | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project -> Project Settings -> API | Safe to expose to the browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project -> Project Settings -> API | Safe to expose to the browser; access is governed by Row Level Security, not secrecy |
| `NEXT_PUBLIC_SITE_URL` | Your own deployment URL | `http://localhost:3000` locally; the real Preview/Production URL on Vercel |

`.env.local` is gitignored and must never be committed. Vercel Preview and
Production deployments get their own copies of these variables set directly in
the Vercel dashboard (Project Settings -> Environment Variables), scoped
separately per environment — see the Milestone 1 setup instructions for the
exact steps.

## Testing

```bash
npm run test        # Vitest unit tests
npm run test:e2e     # Playwright route smoke test
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run build        # Production build
```

## Project status

Milestone 1 (Foundation & Environment Setup) of the approved Phase 1 plan.
Development currently runs on Configuration A (free service tiers, mock data) —
see `docs/IMPLEMENTATION_PLAN.md` section 2 for the full cost breakdown.
