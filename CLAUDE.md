# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Think Tank" — a Next.js 14 (App Router) blog platform where students publish project posts. The `package.json` name (`auth-masterclass`) is a leftover; the live product is Think Tank (deployed at `thinktankindia.vercel.app`). Auth is the most substantial part of the codebase (built on the Auth.js v5 "advanced starter" pattern), layered under a fairly simple posts/users domain.

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build (runs `prisma generate` via postinstall)
npm run start    # serve production build
npm run lint     # next lint (eslint-config-next)
npx prisma generate      # regenerate Prisma client after schema edits
npx prisma db push       # sync schema to the database (no migrations dir exists)
npx prisma studio        # inspect/edit DB
```

There is **no test framework** configured — no test runner, no test files. Don't invent test commands.

## Environment variables

Required (referenced in code, not committed):
- `DATABASE_URL` — PostgreSQL (see `prisma/schema.prisma`)
- `AUTH_SECRET` — Auth.js
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — OAuth
- `RESEND_API_KEY` — transactional email (`lib/mail.ts`)
- `NEXT_PUBLIC_APP_URL` — base URL used to build password-reset links

Note: Firebase config in `firebase.js` is **hardcoded** (from an unrelated `gericht-restaurant` project) rather than env-driven.

## Backend architecture

There is no separate backend service. The "backend" is three layers inside the Next.js app:

1. **Server Actions (`actions/*.ts`)** — the primary write/API surface. Each is a `"use server"` function called directly from client components. They validate input with Zod, call the data layer, and return a `{ success }` or `{ error }` object (forms read these to show toasts/messages). Key ones: `register`, `login`, `reset`, `new-password`, `new-verification`, `settings`, `create-post`, `logout`, `admin` (`adming.ts`). Client components import these and wrap calls in `useTransition`.
2. **Data layer (`data/*.ts`)** — thin Prisma query helpers (`getUserByEmail`, `getPostById`, `getPostsByUserId`, token lookups, etc.). These wrap queries in try/catch and return `null` on failure. Actions and Auth.js callbacks call these rather than touching `db` for reads.
3. **Prisma client (`lib/db.ts`)** — a global singleton to avoid connection exhaustion in dev. Import `db` from `@/lib/db` everywhere; never `new PrismaClient()`.

Note the two overlapping helpers named `getPostsByUserId` (one in `data/post.ts`, one in `data/user.ts`) — check which module you're importing from.

### Search is done in-memory, not in SQL
`getPostsByTitle` (`data/post.ts`) and `getUserByName` (`data/user.ts`) fetch **all** rows with `findMany()` and filter in JS with `.includes()`. Callers pass an already-lowercased query. This is intentional in the current code but is the pattern to change if search needs to scale.

## Auth architecture (the critical, non-obvious part)

Built on Auth.js (NextAuth) **v5 beta** with a deliberate **edge/node split** — this is the single most important thing to understand before editing auth:

- **`auth.config.ts`** — edge-safe config: only the provider list (Google, GitHub, Credentials). The Credentials provider's `authorize` runs bcrypt + a user lookup. Contains **no** Prisma adapter, so it can run in the Edge runtime.
- **`middleware.ts`** — instantiates NextAuth with *only* `auth.config.ts` (edge runtime can't load Prisma/bcrypt). It reads `routes.ts` to gate every request.
- **`auth.ts`** — the full config: spreads `authConfig`, adds `PrismaAdapter`, `session: { strategy: "jwt" }`, and the `jwt`/`session` callbacks. Exports `auth`, `signIn`, `signOut`, `handlers`. This is what the app (server components, actions) uses.

**Rule:** anything that touches Prisma or bcrypt must go in `auth.ts` (or a data helper it calls), never in `auth.config.ts` — putting Node-only code there breaks the middleware/edge build.

### Session enrichment via JWT callbacks
Session is JWT-based. On every token refresh, the `jwt` callback in `auth.ts` reloads the user from the DB and stuffs `role`, `bio`, `linkedin`, `github`, `image`, OAuth status, **and the user's full list of posts** into the token; the `session` callback copies them onto `session.user`. The extended user shape is declared in `next-auth.d.ts` (`ExtendedUser`). Consequences to keep in mind:
- Custom user fields are available on `session.user` app-wide without extra queries.
- But every request that refreshes the token runs a DB read (`getUserById` + `getPostsByUserId` + `getAccountByUserId`), and embeds all posts in the cookie — a real cost/bloat consideration if editing this.

### 2FA and email verification are coded but DISABLED
Two-factor auth and email-verification-gating are **fully implemented but commented out** in `actions/login.ts`, `actions/register.ts`, and the `signIn` callback in `auth.ts`. The Prisma models (`TwoFactorToken`, `TwoFactorConfirmation`, `VerificationToken`), token generators (`lib/tokens.ts`), and mail senders (`lib/mail.ts`) all still exist and work. So: registration currently creates an account with no email confirmation, and login never checks `emailVerified` or 2FA. If asked to "enable 2FA/verification," the work is mostly uncommenting and wiring, not building from scratch.

### Route protection
`routes.ts` defines `publicRoutes`, `authRoutes`, `apiAuthPrefix`, and `DEFAULT_LOGIN_REDIRECT` (`/`). `middleware.ts` redirects logged-out users off protected routes to `/auth/login` and logged-in users off auth pages to `/`. Note `/create-post` is currently listed as **public**. `RoleGate` (`components/auth/role-gate.tsx`) and the `/api/admin` route + `adming.ts` action gate ADMIN-only UI/actions by checking `currentRole()`.

## Email, storage, and other conventions

- **Email (`lib/mail.ts`)** — Resend, sending from `onboarding@resend.dev`. Reset links use `NEXT_PUBLIC_APP_URL`, but the verification link's domain is **hardcoded** to `https://thinktankindia.vercel.app` (inconsistency worth knowing when changing environments).
- **Image/video upload** — done **client-side** straight to Firebase Storage (`actions/img-upload.ts` / `handleImageUpload.ts` using `@firebase/storage`), which returns a download URL. Server actions (`create-post`, `profileImage`) only persist that URL string; files never pass through the server. `Post.images`, `Post.tags` are Postgres `String[]`.
- **Validation** — all input schemas live in `schemas/index.ts` (Zod). Reuse these; server actions and forms share the same schema.
- **Path alias** — `@/*` maps to repo root (`tsconfig.json`). Import as `@/lib/db`, `@/actions/...`, etc.
- **Current-user access** — server side: `currentUser()` / `currentRole()` from `lib/auth.ts`. Client side: `useCurrentUser()` / `useCurrentRole()` hooks (read from `useSession`).
- **UI** — shadcn/ui components in `components/ui` (Radix + `class-variance-authority`, configured via `components.json`); toasts via `sonner`; theming via `next-themes`.

## Gotchas

- `noEmit` + `strict` TypeScript; there's no typecheck script — run `npx tsc --noEmit` if you need one.
- Several files carry typos in identifiers that are load-bearing (referenced elsewhere): `exisitingUser`, `validatedFileds`. Match the existing spelling rather than "fixing" it in isolation.
- `db push` is used instead of migrations — there is no `prisma/migrations` directory, so schema history isn't tracked.
