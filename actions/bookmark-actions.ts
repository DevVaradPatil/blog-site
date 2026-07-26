"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

/**
 * Toggle a bookmark on a post. One row per user per post, enforced by the
 * `@@unique([userId, postId])` on the model.
 */
export const toggleBookmark = async (postId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Sign in to save posts" };

    try {
        const existing = await db.bookmark.findUnique({
            where: { userId_postId: { userId: user.id, postId } },
            select: { id: true },
        });

        if (existing) {
            await db.bookmark.delete({ where: { id: existing.id } });
        } else {
            await db.bookmark.create({ data: { userId: user.id, postId } });
        }

        revalidatePath("/bookmarks");

        return { success: true, bookmarked: !existing };
    } catch {
        return { error: "Could not update bookmark" };
    }
};

export const hasBookmarked = async (postId: string) => {
    const user = await currentUser();
    if (!user?.id) return false;

    const row = await db.bookmark.findUnique({
        where: { userId_postId: { userId: user.id, postId } },
        select: { id: true },
    });
    return Boolean(row);
};
