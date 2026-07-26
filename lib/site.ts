/**
 * Canonical site config.
 *
 * `NEXT_PUBLIC_APP_URL` is the source of truth. It was previously read ad hoc
 * in a couple of places while `lib/mail.ts` hardcoded the production domain —
 * so links disagreed depending on which file built them.
 */
export const siteUrl = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const siteName = "Think Tank";

export const siteDescription =
    "Project write-ups by students — the decisions, the dead ends, and the parts that finally worked.";

/** Absolute URL for a site-relative path. */
export const absoluteUrl = (path: string) =>
    `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
