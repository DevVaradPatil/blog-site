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

## Phase 4 — Design system foundation ✅ COMPLETE
*Goal: one coherent visual language before touching pages.*

### Direction: "Computation Pad"

The brief said *modern editorial*, but the genre these posts actually come from is the **lab report and the datasheet**, not the magazine essay. So: editorial structure crossed with technical-document vernacular. Deliberately avoided the cream + high-contrast-serif + terracotta combination this brief defaults to.

| Token | Light | Role |
|---|---|---|
| `background` | `#F2F5EE` | Pale engineering-pad green |
| `foreground` | `#15191B` | Cool technical ink |
| `muted-foreground` | `#59636B` | Graphite |
| `rule` | grid ruling | Hairlines + graph-paper substrate |
| `signal` | `#A32316` | **Red pen** — marks and emphasis only, never chrome |

**Type:** Zilla Slab (display, engineering-manual register, used with restraint) · IBM Plex Sans (body) · IBM Plex Mono (metadata, code). The Plex family keeps the technical register coherent.

**Signature:** the `SpecStrip` — post metadata set as a datasheet parameter table with dotted leaders, a real device from technical documents where leaders let the eye track from label to value. Paired with a faint graph-paper substrate, since every one of these projects started on ruled paper.

- [x] Full token set, light + dark, with an editorial type scale (tightening tracking as size grows) and tabular figures wherever numbers are compared
- [x] Fonts wired via `next/font` — verified all three load and apply
- [x] **Dark mode finally works.** `next-themes` was a dependency that had never been mounted, so every `.dark` rule in the stylesheet was unreachable. Added `ThemeProvider` + `ThemeToggle`; verified toggling swaps tokens and persists to `localStorage`.
- [x] **Fixed the breakpoint bug.** `theme.screens` sat outside `extend`, which *replaced* Tailwind's entire scale — the project had no `sm`/`md`/`lg`/`xl` at all, which is why every layout was a desktop-first `xs:` override. Moved into `extend`; legacy `xs` still works so existing markup is unaffected.
- [x] `AppShell` / `SiteHeader` / `SiteFooter` / `Container` — replaces two disagreeing navbars and the hardcoded `w-[550px]` widths
- [x] Primitives: `SpecStrip`, `UserAvatar` (deterministic initials-on-gradient — the stock fallback gave every author the same generic icon), `EmptyState` (always offers a next step), `Skeleton` + `PostCardSkeleton`, `.prose-editorial`
- [x] Fixed the 2px scrollbar, which was effectively undraggable
- [x] `prefers-reduced-motion` respected; single app-wide `:focus-visible` ring
- [x] `/design` — internal reference page, unlinked, renders every token in both themes

**Accessibility verified numerically** — all pairs pass WCAG AA in both themes:

| Pair | Light | Dark |
|---|---|---|
| body on background | 16.31 | 15.47 |
| muted on background | 5.70 | 6.99 |
| signal on background | 6.87 | 5.50 |
| primary button text | 15.93 | 15.47 |

`tsc --noEmit` clean · `npm run build` passes.

⚠️ **Pages still use the old styling.** Phase 4 built the system; Phase 5 applies it. The feed, post and profile pages currently render with the new tokens but their original layouts.

## Phase 5 — Page redesigns ✅ COMPLETE

- [x] **Content is finally public.** `publicRoutes` held only `/`, so every post, profile and the feed itself redirected logged-out visitors to login. Added prefix matching for `/post/`, `/user/`, `/tag/`, `/search/`. Verified: all content routes `200` logged out, `/profile` `/create-post` `/settings` still `302`.
- [x] **Post page is a server component** at `/post/[slug]`. It was `"use client"` fetching in `useEffect`, so crawlers got an empty shell and there was no per-post metadata. Now has `generateMetadata` with OpenGraph + Twitter cards. Verified the title, `og:image`, `h1`, headings, blockquotes and code blocks are all in the served HTML.
- [x] **`TiptapRenderer`** renders `contentJson` to React elements, not an HTML string — so user content can't inject markup. No `dangerouslySetInnerHTML` in the path. Link marks are scheme-filtered. Falls back to plain text for legacy posts.
- [x] **Landing** rebuilt — editorial hero, featured lead, browse-by-tag with counts, recent grid, contributor strip. The dead "It's Free" button is gone.
- [x] **Feed** — sort (latest / most upvoted / most discussed), tag filter, pagination. Verified sort ordering is genuinely applied: `6,5,5,5,5,5,4,4,4,3,3,3`.
- [x] **Search** is URL-driven, so results can be linked and shared, and the query runs on the server instead of firing a client action per keystroke.
- [x] **Profile + public profiles** are server components with real stats. The own-profile page previously rendered `ssr: false` and read posts out of the session token.
- [x] **Tag pages** at `/tag/[slug]`; the old `/search/[id]` now 307s there rather than 404ing.
- [x] `lib/format.ts` — the ~20-line relative-time ladder had been pasted into three components with different rounding.
- [x] **Upvote button is a real `<button>`** — it was a `div` with `onClick`, unreachable by keyboard. Now has `aria-pressed` and a proper label.
- [x] Deleted 7 orphaned components (two navbars that disagreed on the product name, two dead profile components, the old cards). **Kept and rewired delete** — it was only reachable through a component I was removing, so deleting blindly would have silently dropped the ability to delete posts.

**Bundle impact:** `/home` **248 kB → 109 kB**. `/post/[slug]` **218 kB → 120 kB** after lazy-loading the Lottie applause animation, which was ~100 kB — more than the rest of the post page combined.

**Two false alarms worth recording:**
- A wave of 500s turned out to be `npm run build` overwriting `.next/` while the dev server was running, breaking its chunk map. Tooling collision, not code — don't build against a live dev server.
- `sort=discussed` 500'd once on a cold compile, then passed on every retry. All three sorts verified directly against the database.

## Phase 6 — Tiptap editor & authoring ✅ COMPLETE

- [x] Tiptap v3 editor: bold, italic, strike, inline code, H2/H3, bullet + numbered lists, quote, code block, link, image, divider, undo/redo
- [x] Inline image upload — toolbar, **paste and drag-drop** all route through the authenticated `/api/upload`
- [x] Cover image picker with preview and removal; replacing a cover deletes the old asset so storage doesn't accrue orphans
- [x] Tag input — chips, comma/Enter to commit, backspace to remove, dedupes on slug so "Next.js" and "nextjs" can't both be added, capped at 6
- [x] **Edit post** at `/post/[slug]/edit` — the feature that never existed. Edit affordance surfaces on the post page and on owned cards.
- [x] Draft/publish with **debounced autosave (2.5s)** and a `beforeunload` guard
- [x] Excerpt, reading time and plain-text content all derived server-side on save via `tiptapToText`
- [x] Deleted the superseded `create-post-form.tsx`, `actions/create-post.ts` and `CreatePostSchema`

**Deliberate choice:** only drafts autosave. A published post is never written behind the author's back — editing live content requires pressing Publish changes.

**Ownership:** the edit route re-fetches through `getEditablePost`, which enforces author-or-ADMIN, so a non-owner can't reach the editor by guessing the URL.

**Verified in-browser:** editor mounts with all 15 tools; Ctrl+A/Ctrl+B applies formatting and the toolbar's `aria-pressed` reflects editor state; autosave persisted a draft with correct slug, excerpt, reading time and `contentJson`; **the draft did not appear in the public feed** (12 published, draft excluded); the edit page hydrated an existing post with 3 headings, a code block, a list, 4 tags, cover and live link.

*Testing note:* `document.execCommand` and bulk `insertText` don't drive ProseMirror (they bypass its input handling and desync the document). Real key events do. Worth knowing before anyone tries to script this editor again.

## Design correction — "bookish" feedback ✅ APPLIED

The Phase 4 direction read as a printed document rather than a modern product. Four things caused it, all replaced:

| Was | Now |
|---|---|
| Zilla Slab (slab serif) | **Space Grotesk** — modern grotesque display |
| IBM Plex Sans/Mono | **Geist Sans / Geist Mono** |
| Engineering-pad green paper `#F2F5EE` | High-contrast neutrals (`#FCFCFD` / `#09090B`) |
| Graph-paper ruling behind pages | Soft accent **glow**, no texture |
| Dotted leader lines in the spec strip | Clean stat row |

Radius 0.375rem → 0.625rem, softer diffuse shadows, pill-shaped tag chips.

**Framer Motion** added with three primitives — `Reveal` (fade-up on scroll, once), `Stagger`/`StaggerItem` (grid entrance), `HoverLift` (spring card lift). All check `useReducedMotion` and render a plain wrapper when reduced motion is requested.

**Accessibility catch:** the brighter red measured **4.37:1** on the light background — under the 4.5:1 AA floor, and `signal` is used for small label text. Dropped lightness 54 → 51, which measures 4.62 on background and 4.74 on card. All pairs now AA in both themes.

## Phase 7 — Feature richness ✅ COMPLETE

- [x] **Comments** — post, reply, edit, soft-delete. Replies flatten to two levels (a reply-to-a-reply attaches to the top-level comment). A parent with replies is kept as a `[deleted]` tombstone so its thread survives. Server component reads the viewer once; client items show owner/ADMIN controls.
- [x] **Real upvotes** — already one-per-user (`Upvote` table + `toggleUpvote`) from Phase 2/5; the button is a keyboard-accessible toggle with optimistic state.
- [x] **Bookmarks** + `/bookmarks` saved feed. Optimistic Save/Saved toggle.
- [x] **Follows** + `/following` feed. Optimistic Follow/Following button with a hover→Unfollow affordance; follower count refreshes on toggle.
- [x] Tag landing pages — done in Phase 5 (`/tag/[slug]`).
- [x] Full-text search UI — done in Phase 5 (server-rendered, ranked).
- [x] Related posts by shared tags — done in Phase 5.
- [x] Header nav gains Following / Saved links when signed in.
- [x] Deleted the orphaned read-only `comment-thread.tsx`.

**Verified in-browser (logged in as admin):**
- Posted a comment → "0 responses" became "1 response", comment rendered, reply button + options menu present, textarea cleared. DB confirmed.
- Bookmark toggled Save → Saved; `/bookmarks` listed all 4 saved posts.
- `/following` showed 2 posts from the 2 followed authors.
- Follow on a profile flipped to Following **and the follower count went 2 → 3** (server refresh, not just optimistic).
- Console clean; all test mutations reverted to the seed baseline afterward.

## Design correction (bookish → modern) ✅ APPLIED — see Phase 6 note

## Hydration bug fix ✅
`Reveal`/`HoverLift` returned a plain `<div>` under reduced motion but `motion.div` otherwise. The server can't read the reduced-motion preference, so it always rendered `motion.div` **with** an inline `style`; a reduced-motion client rendered a plain `<div>` **without** it → "Extra attributes from the server: style at Reveal".

- Motion primitives now always render `motion.*` (SSR-deterministic); reduced motion is handled globally by `<MotionConfig reducedMotion="user">`.
- Follow-on regression caught in the same pass: that alone made reduced-motion users depend on a scroll observer to reveal content (a fast scroll stranded 17 wrappers at `opacity:0`). A `prefers-reduced-motion` CSS rule now forces `.motion-reveal` elements visible — `!important` beats Framer's inline style, and CSS keys off the media query without a render-time branch.
- Verified in a browser that actually has reduced motion on: **console clean**, all reveal wrappers visible without scrolling.

## Phase 8 — SEO, performance, polish 🟡 CORE DONE

- [x] `generateMetadata` per post / profile / tag — landed in Phase 5
- [x] `lib/site.ts` — one canonical URL source. `metadataBase` set, so OpenGraph URLs no longer resolve against localhost.
- [x] **`sitemap.xml`** — 56 URLs (static + published posts + tags). Drafts excluded: it reads `getAllPostSlugs`, which filters on status.
- [x] **`robots.txt`** — disallows `/api/`, `/auth/`, and the authenticated surfaces (`/settings`, `/profile`, `/create-post`, `/bookmarks`, `/following`, `/design`).
- [x] **RSS at `/feed.xml`** — 12 items, `application/rss+xml`, `dc:creator`, categories. Validated: XML declaration, balanced `<item>` tags, **0 unescaped ampersands**, autodiscovery `<link>` in the head.
- [x] Fixed `lib/mail.ts` hardcoding the production domain, so verification links from local/preview no longer point at production.
- [ ] Lighthouse pass — needs a real browser
- [ ] 404 / error / loading boundaries

### Dynamic OG images — removed, with reason
Built `app/post/[slug]/opengraph-image.tsx`, but it fails on this machine: `@vercel/og` builds a file URL for its bundled font and mangles it when the project path contains a space — `E:\Projects\Personal Projects\…` becomes `.\file:\E:\…%20…` → `ERR_INVALID_URL`. The failure is at **module-init inside the library**, before any `fonts` option is read, so it can't be worked around from application code. Edge runtime isn't an alternative — the route queries Prisma.

Removed rather than shipped unverifiable. Posts already carry their real Cloudinary cover as `og:image` via `generateMetadata`, which is better art than a generated gradient. Worth revisiting on Vercel (Linux path, no space), or by moving the repo to a space-free path.

## Motion + input fixes ✅

**Transitions felt instant.** The reduced-motion block flattened `transition-duration` to `0.01ms` on **every** element, killing plain colour fades too. The vestibular concern behind that media query is *movement*, not a 150ms colour crossfade. Now it restricts `transition-property` to non-transform properties at 160ms, so transforms resolve instantly while colour/opacity/shadow still animate. Verified: `1e-05s` → **`0.16s`**.

Note: this environment reports `prefers-reduced-motion: reduce`, which is why it bit at all. On Windows that's **Settings → Accessibility → Visual effects → Animation effects**. With it off, Framer's scroll/hover motion stays suppressed by design (`MotionConfig reducedMotion="user"`) — colour transitions now work either way.

**Input double border.** The global `:focus-visible` applied `ring-offset-2` with `ring-offset-background`, drawing the ring 2px outside the control with a background-coloured gap between — reading as two borders. Now: global ring at `ring-offset-0`, and form controls use a `.form-field` class (border takes the accent colour + a 3px soft halo, no gap). Written as plain CSS in `@layer utilities` rather than `ring-*` utilities, because the ring system composes `box-shadow` from custom properties that weren't resolving on these controls.

⚠️ **Unverified.** The preview pane doesn't composite frames, and its `getComputedStyle` returns only load-time styles — an injected `!important` rule with no pseudo-class also failed to register, which is impossible in a working browser. So dynamic focus styling can't be measured here. The rule is correct by the cascade and present in the production CSS; **please confirm visually.**

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
