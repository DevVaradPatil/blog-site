/**
 * Derivations shared by the create/edit flows, the seed script and the
 * migration backfill. Keeping them here stops the three drifting apart.
 */

const WORDS_PER_MINUTE = 200;

/** "Building a Chatbot!" -> "building-a-chatbot" */
export const slugifyTitle = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80) || "post";

/**
 * Tag slugs strip separators entirely so "Next.js", "next js" and "NextJS"
 * all collapse to "nextjs". Must match the migration's normalisation.
 */
export const slugifyTag = (tag: string): string =>
    tag.toLowerCase().replace(/[^a-z0-9]+/g, "");

export const buildExcerpt = (content: string, length = 200): string => {
    const flat = content.replace(/\s+/g, " ").trim();
    if (flat.length <= length) return flat;
    // Cut on a word boundary rather than mid-word.
    return flat.slice(0, flat.lastIndexOf(" ", length) || length).trimEnd() + "…";
};

export const estimateReadingTime = (content: string): number => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
};

/**
 * Appends a short suffix when a slug is already taken. Callers pass a
 * uniqueness check so this stays free of database concerns.
 */
export const uniqueSlug = async (
    base: string,
    exists: (candidate: string) => Promise<boolean>,
): Promise<string> => {
    if (!(await exists(base))) return base;

    for (let n = 2; n < 50; n++) {
        const candidate = `${base}-${n}`;
        if (!(await exists(candidate))) return candidate;
    }

    return `${base}-${Date.now().toString(36)}`;
};
