<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# studio-space-frontend

Next.js 16.4.3 / React 19 App Router marketing + booking UI ("StudioSpace"). All application data comes from a **separate backend at `http://localhost:4000/api` that is not in this repo**; the only API routes here are Better Auth's handler. There is no test suite.

## Commands

- `npm run dev` — Turbopack dev server. It rewrites the `nextjs-agent-rules` block above; commit that change rather than reverting it.
- `npx tsc --noEmit` — the only typecheck (no `typecheck` script). Currently passes; use it as your green baseline.
- `npm run lint` — bare `eslint` with ESLint 9 flat config. Baseline is **not clean**: 5 pre-existing `react-hooks` errors (`studios/page.tsx`, `studios/[id]/StudioDetailsClient.tsx`, `Navbar.tsx`) plus `no-img-element` warnings. Compare against that baseline instead of assuming lint always passes.
- `npm run build` — currently **fails** prerendering `/studios/[id]` because `params` is awaited outside `<Suspense>` under `cacheComponents` (see below). Do not assume your change caused this; fix by wrapping the data access in `<Suspense>`, caching it with `"use cache"`, or setting `export const instant = false` on the route.

## Architecture

- Everything lives in `src/`; `@/*` maps to `src/*`. Routes: `/`, `/studios`, `/studios/[id]`, `/studios/new`, `/login`, `/signup`. `(auth)` is a route group, so auth pages have no `/auth` URL prefix.
- Auth is Better Auth: server config in `src/lib/auth.ts` (MongoDB adapter, email/password + Google), catch-all handler in `src/app/api/auth/[...all]/route.ts`, React client in `src/lib/auth-client.ts`.
- Protected backend calls are **not** cookie-authenticated. The pattern is `const { data } = await authClient.token()` (JWT plugin) then send `Authorization: Bearer <token>` to `localhost:4000`; see `authenticatedFetch` in `StudioDetailsClient.tsx`. Reuse that pattern rather than inventing session middleware.
- Backend responses use the envelope `{ success, data, message }`; callers branch on `json.success`. Keep that shape when adding requests.
- `src/app/studios/[id]/page.tsx` is the async server component (Next 16: `params` is a `Promise`, so `await params`), delegating the interactive work to `StudioDetailsClient.tsx`. Client components hold nearly all logic (`studios/page.tsx`, `studios/new/page.tsx` are `"use client"` and fetch in effects).
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and React Compiler. `layout.tsx` wraps `Navbar` in `<Suspense>` because it calls `usePathname`; keep a Suspense boundary when adding components that read URL hooks, or prerendering fails.
- Tailwind is v4 wired through a Turbopack loader (`@tailwindcss/turbopack` in `turbopack.rules`), **not** PostCSS. There is no `tailwind.config` or `postcss.config`; theme/appearance lives in `src/app/globals.css` (`@import "tailwindcss"` and `@theme`).
- UI conventions: dark navy/orange Tailwind classes, `lucide-react` icons (`react-icons/fc` for the Google logo), prices in BDT (`৳`, `en-BD` locale).

## Gotchas

- API base URL is inconsistent: `studios/[id]` uses `process.env.NEXT_PUBLIC_API_URL`, while `studios/page.tsx` and `studios/new/page.tsx` hardcode `http://localhost:4000/api/studios`. New code should use the env var; don't copy the hardcoded URL into new features.
- Env is loaded from a gitignored `.env`. Required keys: `MONGODB_URI`, `MONGODB_DB`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_AUTH_URL` (client auth base URL — must match `BETTER_AUTH_URL`), `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL`. Missing Mongo/auth values will break pages at runtime, not at typecheck.
- `public/` is empty, but `StudioDetailsClient.tsx` falls back to `/images/studio-placeholder.jpg`; that image does not exist.
