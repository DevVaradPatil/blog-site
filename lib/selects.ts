import type { Prisma } from "@prisma/client";

/**
 * The only User shape that may cross the network to a browser.
 *
 * Deliberately omits `password` (bcrypt hash), `email`, `emailVerified` and
 * `isTwoFactorEnabled`. Anything reaching a client component must be selected
 * through this, or typed as `PublicUser`.
 */
export const publicUserSelect = {
  id: true,
  name: true,
  image: true,
  bio: true,
  github: true,
  linkedin: true,
  role: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

/**
 * Everything a post card or post page needs, in one round trip.
 *
 * Upvote and comment totals come from `_count` on the relations, so they are
 * always derived from actual rows — there is no counter column for a client to
 * inflate the way the old `upvotes` integer could be.
 */
export const postWithMetaInclude = {
  author: { select: publicUserSelect },
  tags: { include: { tag: true } },
  _count: { select: { upvotes: true, comments: true } },
} satisfies Prisma.PostInclude;

export type PostWithMeta = Prisma.PostGetPayload<{
  include: typeof postWithMetaInclude;
}>;
