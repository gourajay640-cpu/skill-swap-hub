# Skill Swap Hub

Skill Swap Hub is a peer-to-peer skill exchange app for software engineers. Users sign in with Supabase magic links, build a profile of skills they know and want to learn, find two-way matches, send swap requests, and manage incoming, outgoing, and active exchanges.

## Features

- Public landing page with skill search and live/fallback activity feed
- Supabase magic-link authentication
- Profile editor with teach/learn skill selections
- Two-way matching based on complementary skills
- Swap request workflow with incoming, sent, accepted, rejected, and cancelled states
- Dashboard with request counts and recent activity
- Row-level security policies and transition guard for swap request updates

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Add your Supabase project URL and publishable anon key to `.env`. Only set `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_URL` locally for trusted backend setup jobs; never expose them in client code.

4. Apply Supabase migrations from `supabase/migrations` to your Supabase project.

5. Start the app:

```bash
npm run dev
```

## Scripts

- `npm run dev` starts the local Vite dev server.
- `npm run build` creates a production build.
- `npm run preview` previews the production build.
- `npm run lint` runs ESLint.
- `npm run format` formats the project with Prettier.
- `npm run backend:check` verifies the configured Supabase schema, public queries, views, and feed RPC.
- `npm run backend:seed` creates demo users, complementary skills, and swap requests. This requires a local `SUPABASE_SERVICE_ROLE_KEY`.

## Supabase Notes

The app expects these public tables and functions from the migrations:

- `profiles`
- `skills`
- `user_skills`
- `swap_requests`
- `potential_matches`
- `get_recent_swaps_feed`

The final migration hardens swap request transitions so requesters can only cancel pending requests, receivers can only accept or reject pending requests, and participants cannot be changed after a request is created.

## Backend Setup

1. Apply all SQL files in `supabase/migrations` to your Supabase project.
2. Confirm the backend is reachable:

```bash
npm run backend:check
```

3. Optional, for a working demo dataset: add `SUPABASE_SERVICE_ROLE_KEY` to your local `.env`, then run:

```bash
npm run backend:seed
```

The seeder is idempotent for the demo users it creates. It does not need to be committed and the service-role key must stay local only.

To apply migrations from a machine without the Supabase dashboard, use the direct database connection string from Supabase Project Settings > Database as `SUPABASE_DB_URL`.
