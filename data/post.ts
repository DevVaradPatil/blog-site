import "server-only";

import { db } from "@/lib/db";
import { postWithMetaInclude, publicUserSelect } from "@/lib/selects";

/**
 * Read-only post queries. Server-only by design — mutations live in
 * `actions/post-actions.ts` where they can enforce auth and ownership.
 */

/** Only published posts are ever surfaced to readers. */
const publishedOnly = { status: "PUBLISHED" as const };

export type FeedSort = "latest" | "top" | "discussed";

const SORT_ORDER = {
    latest: { publishedAt: "desc" as const },
    top: { upvotes: { _count: "desc" as const } },
    discussed: { comments: { _count: "desc" as const } },
};

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

/** The feed query — sort, optional tag filter, and a page window. */
export const getFeed = async ({
    sort = "latest",
    tag,
    take = 12,
    skip = 0,
}: { sort?: FeedSort; tag?: string; take?: number; skip?: number } = {}) => {
    const where = {
        ...publishedOnly,
        ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    };

    try {
        const [posts, total] = await Promise.all([
            db.post.findMany({
                where,
                include: postWithMetaInclude,
                orderBy: [SORT_ORDER[sort], { publishedAt: "desc" }],
                take,
                skip,
            }),
            db.post.count({ where }),
        ]);

        return { posts, total };
    } catch {
        return { posts: [], total: 0 };
    }
}

/** The most recent post, for the landing page lead slot. */
export const getFeaturedPost = async () => {
    try {
        return await db.post.findFirst({
            where: publishedOnly,
            include: postWithMetaInclude,
            orderBy: { publishedAt: "desc" },
        });
    } catch {
        return null;
    }
}

/** Posts sharing the most tags with the given one. */
export const getRelatedPosts = async (
    postId: string,
    tagSlugs: string[],
    take = 3,
) => {
    if (tagSlugs.length === 0) return [];

    try {
        const candidates = await db.post.findMany({
            where: {
                ...publishedOnly,
                id: { not: postId },
                tags: { some: { tag: { slug: { in: tagSlugs } } } },
            },
            include: postWithMetaInclude,
            take: 12,
        });

        // Rank by shared-tag count, then recency.
        return candidates
            .map((post) => ({
                post,
                shared: post.tags.filter((t) => tagSlugs.includes(t.tag.slug)).length,
            }))
            .sort(
                (a, b) =>
                    b.shared - a.shared ||
                    (b.post.publishedAt?.getTime() ?? 0) -
                    (a.post.publishedAt?.getTime() ?? 0),
            )
            .slice(0, take)
            .map((entry) => entry.post);
    } catch {
        return [];
    }
}

/** Tags ordered by how much they're used — for browse strips. */
export const getPopularTags = async (take = 12) => {
    try {
        return await db.tag.findMany({
            include: { _count: { select: { posts: true } } },
            orderBy: { posts: { _count: "desc" } },
            take,
        });
    } catch {
        return [];
    }
}

export const getTagBySlug = async (slug: string) => {
    try {
        return await db.tag.findUnique({ where: { slug } });
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

/** The post page query — adds the comment thread to the card metadata. */
export const getPostDetailBySlug = async (slug: string) => {
    try {
        return await db.post.findUnique({
            where: { slug },
            include: {
                ...postWithMetaInclude,
                comments: {
                    where: { parentId: null, deletedAt: null },
                    orderBy: { createdAt: "asc" },
                    include: {
                        author: { select: publicUserSelect },
                        replies: {
                            where: { deletedAt: null },
                            orderBy: { createdAt: "asc" },
                            include: { author: { select: publicUserSelect } },
                        },
                    },
                },
            },
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

/** Posts a user has bookmarked, most-recently-saved first. */
export const getBookmarkedPosts = async (userId: string) => {
    try {
        const rows = await db.bookmark.findMany({
            where: { userId, post: { status: "PUBLISHED" } },
            orderBy: { createdAt: "desc" },
            include: { post: { include: postWithMetaInclude } },
        });
        return rows.map((row) => row.post);
    } catch {
        return [];
    }
};

/** Published posts from authors a user follows. */
export const getFollowingFeed = async (userId: string, take = 24) => {
    try {
        return await db.post.findMany({
            where: {
                status: "PUBLISHED",
                author: { followers: { some: { followerId: userId } } },
            },
            include: postWithMetaInclude,
            orderBy: { publishedAt: "desc" },
            take,
        });
    } catch {
        return [];
    }
};

/** Slugs for static generation and the sitemap. */
export const getAllPostSlugs = async () => {
    try {
        return await db.post.findMany({
            where: publishedOnly,
            select: { slug: true, updatedAt: true },
        });
    } catch {
        return [];
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
