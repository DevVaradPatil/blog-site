import "server-only";

import { db } from "@/lib/db";

/**
 * Read-only post queries. Server-only by design — mutations live in
 * `actions/post-actions.ts` where they can enforce auth and ownership.
 */

export const getAllPosts = async () => {
    try {
        return await db.post.findMany({
            orderBy: { createdAt: "desc" },
        });
    } catch {
        return null;
    }
}

export const getPostsByUserId = async (userId: string) => {
    try {
        return await db.post.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: "desc" },
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
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}

/**
 * Filters in the database rather than loading every row and matching in JS.
 */
export const getPostsByTitle = async (query: string) => {
    try {
        return await db.post.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { content: { contains: query, mode: "insensitive" } },
                    { tags: { has: query } },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: 30,
        });
    } catch (e) {
        console.log(e);
        return null;
    }
}
