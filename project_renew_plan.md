# Think Tank — Project Renewal Plan

Living tracker for modernising the site. Tick boxes as we go; each phase ends in a working, deployable state.

**Locked decisions**

| Decision | Choice | Why |
|---|---|---|
| Image storage | **Cloudinary** | Most stable free tier (25 credits/mo pooled across storage/bandwidth/transforms), no card required, soft limits. Built-in `f_auto,q_auto` + resizing directly powers the UI refresh. |
| Existing data | **Wipe & reseed fresh** | Backup taken first. Curated seed beats 5 posts + 7 junk accounts. |
| Editor | **Tiptap rich text** | JSON content, WYSIWYG toolbar, inline image paste. Approachable for non-markdown users. |
| Visual direction | **Modern editorial** | Serif/display headings, generous whitespace, big covers, comfortable reading measure. |

**Why not Neon Object Storage:** it exists now and is S3-compatible and free *during beta* — but Neon states pricing will be announced before GA (expected Q3 2026, i.e. now). That is precisely the free→paid pattern that just killed the Firebase images. Revisit post-GA once pricing is public; `lib/storage.ts` (Phase 1) makes swapping a one-file change.

---

## Audit findings (2026-07-25)

Verified against the live Neon DB and by HTTP-probing every stored image URL.

### 🔴 Security — live in production right now

`data/post.ts` and `data/user.ts` carry a top-level `"use server"`, so **every exported function is a public RPC endpoint** callable by anyone with the action ID — no session required.

| Issue | File | Impact |
|---|---|---|
| `getUserById` / `getUserByName` returned the **full** User row — including the bcrypt `password` hash — and were called from `"use client"` pages | `data/user.ts`, `app/search/page.tsx`, `app/user/[id]/page.tsx`, `app/post/[id]/page.tsx` | **🔥 Worst finding. Password hash disclosure.** Searching any name returned every matching user's hash, serialized into the browser payload. Emails were exposed the same way. *Found during Phase 0, not in the original audit.* |
| `deletePostById(id)` has no auth or ownership check | [data/post.ts:84](data/post.ts:84) | **Anyone can delete any post.** |
| `updatePostUpvotesById(id, random)` takes the increment from the client | [data/post.ts:55](data/post.ts:55), [components/upvote-button.tsx:23](components/upvote-button.tsx:23) | Anyone can set arbitrary upvote counts. No per-user tracking. |
| `createPost` trusts client-supplied `authorId` | [actions/create-post.ts:15](actions/create-post.ts:15) | **Anyone can publish as any user.** |
| `/create-post` listed in `publicRoutes` | [routes.ts:4](routes.ts:4) | Authoring page reachable logged-out. |
| Firebase config committed to git | [firebase.js:11](firebase.js:11) | Low severity — Firebase *web* API keys are designed to be public (security lives in Storage rules), so this is not a credential leak. But it's an unrelated `gericht-restaurant` project's config sitting in our repo, and the bucket is dead. Remove as cruft. |

### 🟠 Broken / dead

- **All 7 Firebase URLs return `402 Payment Required`** — 5 post covers + 2 user avatars. Bucket intact, billing off, so nothing is served. The 7 Google OAuth avatars (`lh3.googleusercontent.com`) return `200` and are unaffected.
- **No ADMIN user exists** — all 14 users are `USER`, so `RoleGate`, `/admin` and `/api/admin` are unreachable dead code.
- **No edit feature at all** — only create and delete.
- `Video` model defined in schema, never used.
- 2FA + email verification fully written but commented out in `actions/login.ts`, `actions/register.ts`, `auth.ts`.

### 🟡 Architecture debt

- **Search loads the whole table**: `getPostsByTitle` / `getUserByName` call `findMany()` then filter in JS.
- **JWT bloat**: the `jwt` callback embeds the user's *entire post array* into the session cookie on every refresh, plus 3 DB queries per token refresh.
- **Post page is client-side** (`app/post/[id]/page.tsx` is `"use client"` fetching in `useEffect`) → no SSR, no SEO, no metadata.
- **No migrations** — `prisma db push` only, no `prisma/migrations` history.
- Raw `<img>` everywhere, no `next/image`, no image domains configured.
- No pagination, no dark mode (despite `next-themes` installed), fixed `w-[550px]` widths.
- **Every content page is behind auth.** `publicRoutes` contains only `/`, so `/home`, `/post/[id]`, `/user/[id]` all 302 to login for logged-out visitors. A blog nobody can read without an account can't be shared or indexed — post/profile/tag pages must become public in Phase 5. *(Found during Phase 1 verification.)*
- **Branding is inconsistent** — the navbar says "Blog It" while metadata and the domain say "Think Tank". Settle this in Phase 4.

---

## Phase 0 — Safety net & security triage ✅ COMPLETE
*Goal: stop the bleeding, make everything reversible.*

- [x] Full DB backup → `backups/2026-07-25-pre-renewal.json` (14 users, 5 posts, 7 accounts, 2 tokens). `/backups` added to `.gitignore` — it holds password hashes and OAuth tokens.
- [x] Baseline Prisma migrations: `prisma/migrations/0_init` generated and marked applied. History starts here.
- [x] **Closed the password-hash leak** — new `lib/selects.ts` defines `publicUserSelect` / `PublicUser` as the only User shape allowed to cross to a browser. Verified empirically: old query returned `password`, new one returns only `id, name, image, bio, github, linkedin, role`.
- [x] `data/user.ts` + `data/post.ts` — blanket `"use server"` removed, now `import "server-only"`. They can no longer become public RPC endpoints.
- [x] New `actions/public-queries.ts` — the deliberate, safe read surface for client components (`fetchPostWithAuthor`, `fetchPublicProfile`, `searchContent`).
- [x] New `actions/post-actions.ts` — `deletePost` (session + author-or-ADMIN) and `upvotePost` (server owns the increment; was client-supplied).
- [x] `createPost` derives `authorId` from `currentUser()`; removed from `CreatePostSchema`.
- [x] Removed `/create-post` from `publicRoutes`.
- [x] Stopped rendering user emails on public profile/search/post pages.
- [x] Search now filters in Postgres (`contains` + `insensitive`) instead of loading every row into JS.
- [x] Confirmed `.env` was never committed to git history.
- [x] `npx tsc --noEmit` clean · `npm run build` passes.

*Moved to Phase 1:* deleting `firebase.js` / `img-upload.ts` / `handleImageUpload.ts` and dropping the deps. They're still load-bearing in `create-post-form.tsx` and `user-profile.tsx`, so they come out together with the Cloudinary replacement rather than breaking uploads in between.

*Optional, manual:* the committed Firebase web config is **not** a credential leak (web API keys are designed to be public — security lives in Storage rules), so revoking is housekeeping, not urgent. It disappears when the file does in Phase 1.

## Phase 1 — Cloudinary storage pipeline ✅ COMPLETE
*Goal: images work again, and never break like this a third time.*

- [x] `cloudinary@2.10.0` installed; env vars set. Verified against the account: **Free plan, 0.15 / 25 credits used.**
- [x] Retired Firebase entirely — deleted `firebase.js`, `actions/img-upload.ts`, `actions/handleImageUpload.ts`, dropped both deps, rewrote the upload paths in `create-post-form.tsx` and `user-profile.tsx`.
- [x] **`lib/storage.ts`** — the single seam to the provider. Nothing else imports a storage SDK, so a future swap is a one-file rewrite. Caps uploads at 2000px and applies `quality:auto`/`fetch_format:auto` so a 12MP phone photo doesn't burn credits.
- [x] **`app/api/upload/route.ts`** — session required, MIME allowlist, 5MB cap. The browser no longer holds provider credentials.
- [x] **`lib/cover.ts` + `components/post-cover.tsx`** — deterministic gradient covers (FNV-1a hash of post id → palette + angle + monogram). Pure CSS, no bytes stored, no bandwidth spent.
- [x] **Defensive fallback** — `isRenderableImageSrc` gates against `remotePatterns`. `next/image` *throws* on unconfigured hostnames, so without this the legacy Firebase URLs would have crashed the feed instead of degrading. Verified: real dead Firebase URL → gradient; Google/Cloudinary URLs → image; null/garbage → gradient.
- [x] `next.config.mjs` → `remotePatterns` for Cloudinary + Google + GitHub avatars.
- [x] Replaced raw `<img>` with `PostCover` in `post-card.tsx`, `post-horizontal-card.tsx`, `app/post/[id]/page.tsx`. *(One `<img>` remains for the local `FileReader` preview in `create-post-form.tsx` — a data URL, which `next/image` can't optimise. Correct as-is.)*
- [x] Fixed `actions/profileImage.ts`, which **always returned `false`** — it returned from inside a `.then()` while the outer function fell through, so callers could never distinguish success from failure.
- [x] Verified end-to-end against Cloudinary: upload → `200` delivery → delete → `0` assets remaining in account.
- [x] `tsc --noEmit` clean · `npm run build` passes.

**Bundle win:** removing the Firebase client SDK cut `/create-post` from **25.2 kB → 3.4 kB** first-load JS, `/` from 7.71 → 2.55 kB, `/search` from 3.88 kB → 932 B.

## Phase 2 — Schema overhaul ✅ COMPLETE
*Goal: a data model that can actually support a blog.*

- [x] `Post`: `slug` (unique), `status`, `coverImage`, `coverImageId`, `excerpt`, `contentJson` (Tiptap), `readingTime`, `publishedAt`
- [x] `Comment` — threaded via `parentId` self-relation, soft delete so removing a parent doesn't orphan replies
- [x] `Upvote` — `@@unique([userId, postId])`. **One vote per user is now enforced by the database**, not by trusting a client-supplied integer. Verified: duplicate insert rejected with `P2002`.
- [x] `Bookmark` and `Follow`
- [x] Normalised `Tag` + `PostTag`; the migration backfilled the existing `String[]` arrays, collapsing "Next.js"/"nextjs" onto one slug
- [x] **Postgres full-text search** — `searchVector` as a `GENERATED ALWAYS AS … STORED` column + GIN index. Being generated means nothing in app code has to remember to maintain it. Weighted title > excerpt > body; verified title match ranks **0.638** vs body-only **0.122**
- [x] Dropped unused `Video` model
- [x] Indexes on `Post(status, publishedAt)`, `Post(authorId)`, `Comment(postId, createdAt)`, `Upvote(postId)`, etc.
- [x] Cascade deletes verified — removing an author cleans up posts, comments and votes
- [x] Slimmed the JWT: the user's **entire post array** is no longer embedded in the session cookie, and the per-refresh query is gone
- [x] `lib/post-utils.ts` — slug/excerpt/reading-time derivations shared by create, seed and migration so the three can't drift
- [x] `tsc --noEmit` clean · `npm run build` passes · `migrate status` up to date

### ⚠️ Incident: production data lost during this phase

While generating the migration diff I passed `--shadow-database-url "$DATABASE_URL"` — pointing Prisma's **shadow database at production**. Prisma drops and recreates the shadow DB to compute a diff, so it wiped all rows. Schema was rebuilt correctly; the data was not.

- **Lost:** 14 users, 5 posts, 7 OAuth account links, 2 verification tokens.
- **Recoverable:** yes — the Phase 0 backup (`backups/2026-07-25-pre-renewal.json`) is intact and verified, with all 14 users (password hashes included), 5 posts and 7 accounts.
- **Net impact:** low. Phase 3 was going to truncate these same tables in the next step, and the chosen path was *wipe and reseed fresh*. Restoring would mean transforming old-shape rows (`tags` array, `upvotes` int) into the new schema for data we're discarding anyway.
- **Lesson:** never point `--shadow-database-url` at a real database. Prisma needs a *separate throwaway* database for shadow operations.

*If you'd rather have the original 5 posts back before seeding, say so and I'll write a transform-and-restore script from the backup.*

### Baseline correction
The Phase 0 note that migrations were baselined was **wrong** — `prisma migrate resolve --applied 0_init` had silently not persisted (`prisma/migrations/migration_lock.toml` was missing, so no `_prisma_migrations` table was ever created). The "Database schema is up to date!" I reported was comparing schema to datamodel, not migration history. Fixed and verified this phase: the table now exists with both migrations recorded.

## Phase 3 — Wipe & seed ✅ COMPLETE
*Goal: a site that looks alive on first load.*

**Seeded:** 8 users · 12 posts · 41 tags · 10 comments (with reply threads) · 52 upvotes · 18 follows · 19 bookmarks.
**Covers:** 12/12 uploaded to Cloudinary, all verified serving `200`, all rendering through `next/image`.
**Cost:** 21 MB of source JPEGs → **3.1 MB** stored after Cloudinary re-encoding. Total usage **0.16 / 25 credits**.
**Verified in-browser:** logged in as admin, feed renders all 12 posts with authors, tags and vote counts; 12/12 images load, 0 broken.

- [x] `prisma/seed-data.ts` — 8 authors and **12 fresh posts** written from scratch (the old topics are not reused). Authored as structured blocks so one source emits both the Tiptap document and the plain text that feeds search and excerpts.
- [x] `prisma/seed.ts` + `npm run seed` / Prisma seed hook. Idempotent and re-runnable, so dropping images in later and re-running just attaches them.
- [x] Safety gate: refuses to run when rows exist unless passed `--yes`, and prints the counts it is about to destroy.
- [x] Seeded content includes comment threads with replies, per-user upvotes, follows and bookmarks — so no counter renders as zero.
- [x] `tsx` installed; verified `--env-file=.env` loads Cloudinary + DB credentials.
- [x] Verified image discovery: `crop-advisory.png` → *upload*, missing names → *gradient*.
- [x] All 12 cover images supplied and uploaded (one arrived as `drip-irrigation.jpg`; renamed to `smart-irrigation.jpg` to match the manifest)
- [x] Seed run and verified end-to-end

### Accounts

| Account | Credentials | Notes |
|---|---|---|
| **Varad Patil** — `varadapatil123@gmail.com` | password `thinktank2026` | **ADMIN.** The first admin this site has ever had. Override at seed time with `SEED_ADMIN_PASSWORD`. |
| Ananya Deshpande, Rohan Mehta, Priya Nair, Karthik Raman, Sneha Iyer, Aditya Kulkarni, Meera Joshi | none | Display-only authors — `password: null`, so they cannot sign in. They exist to give posts bylines. |

⚠️ **Signing in with Google will fail on the admin account.** The seeded user has that email but no linked OAuth `Account` row, so Auth.js raises `OAuthAccountNotLinked` — deliberate protection against email-based account takeover. Use the credentials form, or ask me to link the Google account properly.

🔐 **Change that password.** It's in this repo's plan file and in the chat transcript. Settings → password once you're in.

Avatars needed no files — seeded users fall back to a deterministic initials-on-gradient avatar.

## Phase 4 — Design system foundation
*Goal: one coherent visual language before touching pages.*

- [ ] Tokens: editorial type scale, semantic colour vars, spacing/radius/shadow rhythm
- [ ] Font pairing — display serif for headings + clean sans for body (replaces Poppins-everywhere)
- [ ] Wire dark mode properly (`next-themes` is installed but unused) + toggle
- [ ] Shared `AppShell`: real responsive nav, footer, container widths (kills `w-[550px]` and ad-hoc `xs:`)
- [ ] Primitives: skeletons, empty states, error states, `Badge`/`Tag`, `Prose` wrapper
- [ ] Motion pass — subtle, tasteful transitions

## Phase 5 — Page redesigns
- [ ] **Landing** — the current single-`h1`-plus-gif is the weakest page. New: editorial hero, featured post, latest grid, browse-by-tag, contributor strip, real CTA (the dead "It's Free" button goes)
- [ ] **Feed** (`/home`) — responsive card grid, sort (Latest/Trending/Top), tag filter, pagination or infinite scroll
- [ ] **Post page** — convert to **server component**, editorial layout, cover, reading progress, TOC, author card, related posts, comments
- [ ] **Profile** — header w/ bio + socials, tabs (Posts/Bookmarks/About), stats
- [ ] **Auth pages** — restyle to match
- [ ] **Search** — unified results, empty/loading states

## Phase 6 — Tiptap editor & authoring
- [ ] Tiptap with headings, bold/italic, lists, quote, link, code block + syntax highlighting, horizontal rule
- [ ] Inline image upload (paste/drag) → Cloudinary
- [ ] Cover image picker with crop
- [ ] Tag input with autocomplete against existing tags
- [ ] **Edit post** (`/post/[id]/edit`) — currently missing entirely
- [ ] Draft/publish + autosave, "unsaved changes" guard
- [ ] Auto excerpt + reading time on save
- [ ] Render Tiptap JSON safely server-side

## Phase 7 — Feature richness
- [ ] Comments UI — post, reply, edit, delete, optimistic
- [ ] Real upvotes — one per user, toggle, optimistic
- [ ] Bookmarks + saved feed
- [ ] Follow authors + "following" feed
- [ ] Tag landing pages
- [ ] Full-text search UI w/ highlighting
- [ ] Related posts by shared tags

## Phase 8 — SEO, performance, polish
- [ ] `generateMetadata` per post/profile/tag
- [ ] Dynamic OG images via `next/og`
- [ ] `sitemap.xml`, `robots.txt`, RSS feed
- [ ] `revalidate` / `revalidatePath` caching strategy
- [ ] Lighthouse pass — CLS, LCP, image sizing
- [ ] a11y pass — contrast, focus rings, landmarks, alt text
- [ ] 404 / error / loading boundaries

## Phase 9 — Deploy & longevity
- [ ] Cloudinary + new env vars into Vercel
- [ ] Run migrations against production
- [ ] Decide on re-enabling email verification (Resend already wired)
- [ ] Fix hardcoded `thinktankindia.vercel.app` in `lib/mail.ts` → `NEXT_PUBLIC_APP_URL`
- [ ] Update `README.md` (still the create-next-app boilerplate) + refresh `CLAUDE.md`
- [ ] Rename package from `auth-masterclass` → `think-tank`
- [ ] Uptime monitor; note Neon free-tier compute autosuspend behaviour

---

## Images I need from you

**You are not blocked on this.** Phase 1 ships an auto-cover generator, so any missing file falls back to a generated gradient cover that looks intentional. Supply what you have, whenever.

Drop files into **`seed/images/posts/`** using these exact names (`.jpg` or `.png` both fine — I'll detect):

| Filename | Post it belongs to |
|---|---|
| `spam-detection` | SmartShield AI: Keeping Spam at Bay |
| `iot-waste-segregation` | Smart Waste Segregation System Using IoT |
| `health-chatbot` | AI-Based Personal Health Assistant Chatbot |
| `spotify-clone` | Melodia — Spotify clone *(or I can screenshot spotify-2-o.vercel.app myself)* |
| `dev-portfolio` | My DevVerse portfolio *(or I can screenshot varadportfolio.web.app)* |
| `campus-navigator` | AR campus navigation app |
| `crop-disease-detection` | Leaf-image crop disease classifier |
| `smart-attendance` | Face-recognition attendance system |
| `expense-tracker` | Student expense tracker dashboard |
| `study-notes-app` | Collaborative study notes app |
| `drone-survey` | Drone-based land survey |
| `ev-charging-locator` | EV charging station locator |

Optional: `seed/images/avatars/varad.jpg` for your own profile. All other avatars are auto-generated — send nothing.

---

## Risks & watch-items

- **Wipe is irreversible** beyond the Phase 0 backup. I'll show the exact row counts and get a final confirmation immediately before truncating.
- **Cloudinary free tier is pooled** — storage + bandwidth + transforms share 25 credits/mo. `f_auto,q_auto` plus right-sized `next/image` keeps a portfolio-traffic blog far under it.
- **Firebase originals are recoverable** if you ever want them: the files still exist at 402, so temporarily enabling Blaze billing would let you pull them via `gsutil` before downgrading. Only worth it if those exact images matter.
- **Neon free-tier compute autosuspends** on inactivity — expect a cold-start delay on the first request after idle.
- Phases 4–5 are the largest chunk; expect the most iteration on visual taste there.
