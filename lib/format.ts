/**
 * Date formatting, in one place.
 *
 * The same ~20-line relative-time ladder was pasted into `post-card.tsx`,
 * `post-horizontal-card.tsx` and the post page, each with its own rounding.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export const relativeTime = (date: Date | string): string => {
    const then = new Date(date).getTime();
    const elapsed = Date.now() - then;

    if (elapsed < MINUTE) return "just now";
    if (elapsed < HOUR) {
        const n = Math.floor(elapsed / MINUTE);
        return `${n} minute${n > 1 ? "s" : ""} ago`;
    }
    if (elapsed < DAY) {
        const n = Math.floor(elapsed / HOUR);
        return `${n} hour${n > 1 ? "s" : ""} ago`;
    }
    if (elapsed < WEEK) {
        const n = Math.floor(elapsed / DAY);
        return `${n} day${n > 1 ? "s" : ""} ago`;
    }
    if (elapsed < MONTH) {
        const n = Math.floor(elapsed / WEEK);
        return `${n} week${n > 1 ? "s" : ""} ago`;
    }
    if (elapsed < YEAR) {
        const n = Math.floor(elapsed / MONTH);
        return `${n} month${n > 1 ? "s" : ""} ago`;
    }
    const n = Math.floor(elapsed / YEAR);
    return `${n} year${n > 1 ? "s" : ""} ago`;
};

/** ISO date for <time datetime> — machine readable, stable across locales. */
export const isoDate = (date: Date | string): string =>
    new Date(date).toISOString().slice(0, 10);

/** "14 May 2026" — unambiguous, avoids the US/rest-of-world ordering trap. */
export const longDate = (date: Date | string): string =>
    new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

export const plural = (n: number, singular: string, pluralForm?: string) =>
    `${n} ${n === 1 ? singular : pluralForm ?? `${singular}s`}`;
