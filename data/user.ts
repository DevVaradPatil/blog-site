import "server-only";

import { db } from "@/lib/db";
import { publicUserSelect } from "@/lib/selects";

/**
 * NOTE: this module is server-only and intentionally has no "use server"
 * directive. These functions return full User rows including the bcrypt
 * password hash, so they must never become callable server actions. Client
 * components read profiles through `actions/public-queries.ts` instead.
 */

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                email,
            }
        });
        return user;
    } catch {
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                id,
            }
        });
        return user;
    } catch {
        return null;
    }
}

export const getPostsByUserId = async (id: string) => {
    try {
        const posts = await db.post.findMany({
            where: {
                authorId: id,
            }
        });
        return posts;
    } catch {
        return null;
    }
}

/** Safe to hand to a client component. */
export const getPublicUserById = async (id: string) => {
    try {
        return await db.user.findUnique({
            where: { id },
            select: publicUserSelect,
        });
    } catch {
        return null;
    }
}

/** Public profile plus the counts a profile header displays. */
export const getPublicProfileWithStats = async (id: string) => {
    try {
        return await db.user.findUnique({
            where: { id },
            select: {
                ...publicUserSelect,
                createdAt: true,
                _count: { select: { posts: true, followers: true, following: true } },
            },
        });
    } catch {
        return null;
    }
}

/** Authors with the most published posts — for the landing contributor strip. */
export const getTopContributors = async (take = 6) => {
    try {
        return await db.user.findMany({
            where: { posts: { some: { status: "PUBLISHED" } } },
            select: {
                ...publicUserSelect,
                _count: { select: { posts: true } },
            },
            orderBy: { posts: { _count: "desc" } },
            take,
        });
    } catch {
        return [];
    }
}

/** Safe to hand to a client component. */
export const searchPublicUsersByName = async (name: string) => {
    try {
        return await db.user.findMany({
            where: {
                name: { contains: name, mode: "insensitive" },
            },
            select: publicUserSelect,
            take: 20,
        });
    } catch {
        return null;
    }
}
