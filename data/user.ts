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
