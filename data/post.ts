import "server-only";

import { db } from "@/lib/db";
import { postWithMetaInclude } from "@/lib/selects";

/**
 * Read-only post queries. Server-only by design — mutations live in
 * `actions/post-actions.ts` where they can enforce auth and ownership.
 */

/** Only published posts are ever surfaced to readers. */
const publishedOnly = { status: "PUBLISHED" as const };

export const getAllPosts = async () => {
    try {
        return await db.post.findMany({
            where: publishedOnly,
            include: postWithMetaInclude,
            orderBy: { publishedAt: "desc" },
        });
    } catch {
        return null;
    }
}

export const getPostsByUserId = async (userId: string) => {
    try {
        return await db.post.findMany({
            where: { authorId: userId, ...publishedOnly },
            include: postWithMetaInclude,
            orderBy: { publishedAt: "desc" },
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getPostById = async (id: string) => {
    try {
        return await db.post.findUnique({
            where: { id },
            include: postWithMetaInclude,
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getPostBySlug = async (slug: string) => {
    try {
        return await db.post.findUnique({
            where: { slug },
            include: postWithMetaInclude,
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * Full-text search over the generated `searchVector` column.
 *
 * Replaces the original approach of loading every row and filtering in JS.
 * Ranking is weighted (title > excerpt > body) by the column definition, and
 * `websearch_to_tsquery` accepts natural syntax like `"exact phrase" -excluded`.
 */
export const searchPosts = async (query: string, limit = 30) => {
    try {
        const ranked = await db.$queryRaw<{ id: string }[]>`
            SELECT "id"
            FROM "Post"
            WHERE "status" = 'PUBLISHED'
              AND "searchVector" @@ websearch_to_tsquery('english', ${query})
            ORDER BY ts_rank("searchVector", websearch_to_tsquery('english', ${query})) DESC
            LIMIT ${limit}
        `;

        if (ranked.length === 0) return [];

        const posts = await db.post.findMany({
            where: { id: { in: ranked.map((row) => row.id) } },
            include: postWithMetaInclude,
        });

        // Restore the relevance order the ranking query produced.
        const order = new Map(ranked.map((row, index) => [row.id, index]));
        return posts.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const getPostsByTag = async (tagSlug: string) => {
    try {
        return await db.post.findMany({
            where: { ...publishedOnly, tags: { some: { tag: { slug: tagSlug } } } },
            include: postWithMetaInclude,
            orderBy: { publishedAt: "desc" },
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}
