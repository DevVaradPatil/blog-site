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
 * Flattens a Tiptap document to plain text.
 *
 * The plain-text copy is what feeds the excerpt, the reading time and the
 * Postgres search vector, so it has to be derivable on the server without
 * rendering React.
 */
export const tiptapToText = (doc: unknown): string => {
    const blocks: string[] = [];

    const walk = (node: any, into: string[]) => {
        if (!node || typeof node !== "object") return;

        if (node.type === "text" && typeof node.text === "string") {
            into.push(node.text);
            return;
        }

        // Block-level nodes each become their own paragraph in the output.
        const isBlock = [
            "paragraph",
            "heading",
            "listItem",
            "blockquote",
            "codeBlock",
        ].includes(node.type);

        if (isBlock) {
            const parts: string[] = [];
            (node.content ?? []).forEach((child: any) => walk(child, parts));
            const text = parts.join("").trim();
            if (text) blocks.push(text);
            return;
        }

        (node.content ?? []).forEach((child: any) => walk(child, into));
    };

    const scratch: string[] = [];
    walk(doc, scratch);

    return blocks.join("\n\n");
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
