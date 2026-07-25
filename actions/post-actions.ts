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
 * Toggle the signed-in user's upvote on a post.
 *
 * The original accepted the increment from the client (`Math.random() * 3`),
 * so any caller could add an arbitrary number of votes. Votes are now rows in
 * `Upvote` with a `@@unique([userId, postId])`, meaning one vote per user is
 * enforced by the database rather than by trusting the caller.
 */
export const toggleUpvote = async (id: string) => {
    const user = await currentUser();

    if (!user?.id) {
        return { error: "Sign in to upvote" };
    }

    try {
        const existing = await db.upvote.findUnique({
            where: { userId_postId: { userId: user.id, postId: id } },
            select: { id: true },
        });

        if (existing) {
            await db.upvote.delete({ where: { id: existing.id } });
        } else {
            await db.upvote.create({ data: { userId: user.id, postId: id } });
        }

        const upvotes = await db.upvote.count({ where: { postId: id } });

        revalidatePath(`/post/${id}`);
        revalidatePath("/home");

        return { success: true, upvotes, hasUpvoted: !existing };
    } catch {
        return { error: "Could not upvote" };
    }
}

/** Whether the signed-in user has already upvoted a post. */
export const hasUpvoted = async (postId: string) => {
    const user = await currentUser();

    if (!user?.id) return false;

    const vote = await db.upvote.findUnique({
        where: { userId_postId: { userId: user.id, postId } },
        select: { id: true },
    });

    return Boolean(vote);
}
