# Think Tank

A blog platform where students publish write-ups of the projects they build. Write a post in a
rich-text editor, tag it, and let other students upvote, comment, bookmark and follow you.

**Live:** [thinktank-kappa.vercel.app](https://thinktank-kappa.vercel.app)

## Features

- **Rich-text posts** with a Tiptap editor, cover images, tags and edit/delete.
- **Community:** upvotes, threaded comments, bookmarks, follows and a "following" feed.
- **Discovery:** search posts and users, tag pages, an RSS feed (`/feed.xml`), sitemap and robots.
- **Profiles** with bio, avatar and GitHub/LinkedIn links.
- **Auth:** email + password, Google and GitHub OAuth, password reset by email, and role-gated admin
  pages. Email verification and 2FA are implemented but currently switched off.
- **Light/dark theme.**

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router, Server Actions), TypeScript |
| Auth | Auth.js (NextAuth v5): edge-safe `auth.config.ts` for middleware, full `auth.ts` with Prisma adapter and JWT sessions |
| Database | PostgreSQL via Prisma |
| Images | Cloudinary, uploaded through an authenticated `/api/upload` route with type and size checks |
| Email | Resend |
| UI | Tailwind CSS, shadcn/ui (Radix), sonner, next-themes |
| Validation | Zod schemas shared by forms and server actions |

## Project structure

```
actions/      server actions: auth, posts, comments, bookmarks, follows, settings
app/          routes: home, post/[slug], create-post, user/[id], tag/[slug], search, auth/*, admin
components/   editor, comments, cards, layout and auth UI
data/         Prisma query helpers
lib/          db client, auth helpers, mail, storage, tokens
prisma/       schema, migrations and seed
schemas/      Zod schemas
```

## Getting started

```bash
npm install          # also runs prisma generate
cp .env.example .env # if present; otherwise create .env with the variables below
npx prisma db push   # create the tables
npm run seed         # optional sample data
npm run dev          # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js secret (`npx auth secret`) |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | GitHub OAuth |
| `RESEND_API_KEY` | Password-reset and verification emails |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image uploads |
| `NEXT_PUBLIC_APP_URL` | Base URL used in email links |
| `SEED_ADMIN_PASSWORD` | Password for the admin user created by `npm run seed` |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm run seed` | Seed the database |
