# Emotion Wheel App - AI Coding Guidelines

## Architecture Overview
React + TypeScript SPA (Vite) with a separate Express/TypeScript backend. Two processes run concurrently:
- **Frontend** (port 5173): React UI with Vite, Tailwind CSS, Framer Motion
- **Backend** (port 3001): Express server in `server/server.ts` — proxies Anthropic API calls, manages Supabase writes via service-role key, and caches AI responses to `.cache/`

Data flow: Frontend → Express API (`VITE_API_URL`) → Anthropic Claude / Supabase. The frontend also reads directly from Supabase (emotions table, auth) using the anon key, but all **writes** (emotion logs, coping strategies) go through the Express server which authenticates via Bearer token.

## How to Run
```bash
npm install
npm run dev:full    # starts both server (tsx server/server.ts) and Vite frontend via concurrently
npm run server      # backend only (port 3001)
npm run dev         # frontend only (port 5173)
npm run build       # tsc && vite build
npm run type-check  # tsc --noEmit
```
Requires `.env.local` with: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ANTHROPIC_API_KEY`, and optionally `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_MODEL_NAME`, `VITE_API_URL`.

## Key Directories & Files
- `src/types/emotion.types.ts` — All shared TypeScript interfaces (`Emotion`, `EmotionLog`, `CopingStrategy`, `User`)
- `src/utils/constants.ts` — `EMOTION_WHEEL_DATA` — hardcoded 3-tier emotion hierarchy used as fallback when Supabase is unavailable
- `src/store/useEmotionStore.ts` — Zustand store for wheel state, modal state, and emotion logs
- `src/services/supabase.ts` — Frontend Supabase client (anon key, read-only for most tables)
- `src/services/anthropic.ts` — Client-side service that calls the Express backend (NOT Anthropic directly)
- `server/server.ts` — All backend API routes in a single file; uses Supabase admin client (service-role key)
- `DATABASE_SETUP.sql` — Full Supabase schema (tables, RLS policies, indexes, emotion seed data)

## Component Patterns
Components live in `src/components/{FeatureName}/{FeatureName}.tsx` (one component per folder). Key components:
- **EmotionWheel** — 3-tier drill-down: Tier 1 → Tier 2 → Tier 3. Loads from Supabase, falls back to `EMOTION_WHEEL_DATA`
- **EmotionModal** — Shows selected emotion details, fetches AI coping strategies, allows notes and logging. Autosaves draft notes to `localStorage`
- **Auth** — Supabase email/password auth with Google OAuth and guest mode
- **EmotionLogList** — Paginated log history with breadcrumb trails (Tier1 › Tier2 › Tier3)
- **ui/** — Shared primitives (`Button`, `LoadingSpinner`)

## State Management
- **Zustand** (`useEmotionStore`) for UI state: selected tiers, modal visibility, wheel rotation
- **Custom hooks** for side-effect logic: `useAuth` (auth state + Supabase listener), `useEmotionLog` (log emotion with guest/authenticated branching)
- Guest users store emotion logs in `localStorage` under key `guest_emotion_logs`

## Emotion Data Model
Emotions are a 3-tier tree: `tier: 1 | 2 | 3`, linked by `parentId`/`parent_id`. Each emotion has `id`, `name`, `color`, `description`, and optional `triggers`, `physicalSensations`, `characteristics`. The DB uses `snake_case` columns; frontend types use `camelCase` — mapping happens in hooks and server routes.

## Backend API Routes (server/server.ts)
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | No | Health check |
| `/api/health-db` | GET | No | DB read/write check |
| `/api/coping-strategies` | POST | No | Generate AI strategies (caches tier-3 responses to `.cache/`) |
| `/api/coping-strategies` | GET | No | Fetch persisted strategies by `emotionId` |
| `/api/analyze-mood` | POST | No | AI mood analysis |
| `/api/log-emotion` | POST | Bearer | Log emotion for authenticated user |
| `/api/emotion-logs` | GET | Bearer | Paginated emotion logs with breadcrumbs |

## Conventions
- **Path alias**: `@/*` maps to `src/*` (configured in `tsconfig.json`; not widely used yet — prefer explicit relative imports to match existing code)
- **Styling**: Tailwind CSS + custom emotion colors in `tailwind.config.ts` (`emotion-happy`, `emotion-sad`, etc.). Animations via Framer Motion, not CSS transitions
- **Helpers**: `src/utils/helpers.ts` has `cn()` (class joiner), `debounce`, `throttle`, `hexToRgb`, `formatDate`
- **Error handling**: Try/catch with user-facing error state in hooks; server returns detailed errors in dev, generic messages in production (`NODE_ENV=production`)
- **Env types**: All `VITE_*` env vars are typed in `src/env.d.ts`
- **Server runs via tsx**: The backend uses `tsx` to run TypeScript directly — no separate compile step

## Database (Supabase)
Tables: `emotions`, `emotion_logs`, `coping_strategies`, `user_preferences`. RLS is enabled on `emotion_logs` and `user_preferences` — users can only access their own rows. The server bypasses RLS using `SUPABASE_SERVICE_ROLE_KEY`. Full schema and seed data are in `DATABASE_SETUP.sql` and `EmotionInserts.sql`.
