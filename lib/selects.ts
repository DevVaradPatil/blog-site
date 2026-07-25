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
