---
name: react-conventions
description: >
  Activates when editing .ts or .tsx files in the ScoutAI frontend. Enforces React 18 +
  TypeScript strict mode, Zustand store patterns, Axios-via-api-layer rule, Tailwind
  design token usage, and Recharts component patterns.
---

# React Conventions — ScoutAI Frontend

## TypeScript
- No `any` — every prop, state, and API response has an interface in `src/types/`
- Type files: `player.ts`, `session.ts`, `metrics.ts` — import from there, never re-declare inline
- Prefer `interface` over `type` for object shapes; use `type` for unions/aliases

## API layer (hard rule)
- All HTTP calls live in `src/api/` only: `sessions.ts`, `players.ts`, `metrics.ts`
- Components never call `axios` directly — they call `src/api/` functions
- Axios instance with base URL and auth header in `src/api/client.ts`

```typescript
// src/api/players.ts
export async function fetchPlayer(id: number): Promise<Player> {
  const { data } = await client.get<Player>(`/players/${id}`)
  return data
}

// component — correct
const player = await fetchPlayer(id)

// component — wrong
axios.get(`/api/players/${id}`)  // never
```

## Zustand stores
- One store per domain: `playerStore.ts`, `sessionStore.ts` in `src/store/`
- Use `immer` middleware for nested state updates
- Selectors over full-store subscriptions to avoid unnecessary re-renders

## Component structure
- `src/pages/` — route-level components (Dashboard, PlayerProfile, SessionUpload, Reports, Login)
- `src/components/` — reusable UI split into `layout/`, `dashboard/`, `goalkeeper/`, `shared/`
- Shared primitives: `Button`, `Badge`, `Card`, `Spinner`, `EmptyState`

## Design tokens (Tailwind)
Use CSS vars defined in `tailwind.config.ts`:
- Backgrounds: `bg-[#040a06]`, `bg-[#080f0a]`, `bg-[#0c1510]`
- Accents: `text-[#00e676]` (green), `text-[#40c4ff]` (blue), `text-[#ffab40]` (amber)
- Text: `text-[#c8d8cc]` (primary), `text-[#4a6855]` (muted)
- Fonts: `font-display` (Barlow Condensed), `font-body` (Barlow), `font-mono` (Share Tech Mono)

## Recharts
- Wrap charts in a `ResponsiveContainer` with `width="100%"`
- Metric color map (use consistently): Passes `#40c4ff` | Shots `#ff5252` | Sprints `#ffab40` | Dribbles `#ea80fc` | Control `#69f0ae` | Saves `#ff9f43`
