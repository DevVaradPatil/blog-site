"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

/**
 * Delete a post. Only the author or an ADMIN may do this.
 *
 * Replaces the old `deletePostById` in `data/post.ts`, which was exported from
 * a "use server" module with no auth check at all — meaning anyone could
 * delete any post.
 */
export const deletePost = async (id: string) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    const post = await db.post.findUnique({
        where: { id },
        select: { id: true, authorId: true },
    });

    if (!post) {
        return { error: "Post not found" };
    }

    const isOwner = post.authorId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) {
        return { error: "You can only delete your own posts" };
    }

    await db.post.delete({ where: { id } });

    revalidatePath("/home");
    revalidatePath("/profile");

    return { success: "Post deleted" };
}

/**
 * Increment a post's upvotes. The server owns the increment.
 *
 * The old version accepted the amount from the client (`Math.random() * 3`),
 * so any caller could add an arbitrary number of upvotes. Real one-vote-per-user
 * tracking arrives in Phase 7 with the `Upvote` model.
 */
export const upvotePost = async (id: string) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Sign in to upvote" };
    }

    try {
        const post = await db.post.update({
            where: { id },
            data: { upvotes: { increment: 1 } },
            select: { upvotes: true },
        });

        revalidatePath(`/post/${id}`);

        return { success: true, upvotes: post.upvotes };
    } catch {
        return { error: "Could not upvote" };
    }
}
