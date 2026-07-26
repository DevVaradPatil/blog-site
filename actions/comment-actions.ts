"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { publicUserSelect } from "@/lib/selects";

const CommentSchema = z.object({
    postId: z.string().min(1),
    parentId: z.optional(z.string()),
    body: z.string().trim().min(1, "Write something").max(2000, "Keep it under 2000 characters"),
});

/**
 * Post a comment or a reply.
 *
 * Replies are one level deep: if the parent is itself a reply, the new comment
 * attaches to that reply's parent instead, so threads never nest past two
 * levels and the UI stays legible.
 */
export const addComment = async (input: z.infer<typeof CommentSchema>) => {
    const user = await currentUser();

    if (!user?.id) return { error: "Sign in to comment" };

    const parsed = CommentSchema.safeParse(input);
    if (!parsed.success) {
        return { error: parsed.error.errors[0]?.message ?? "Invalid comment" };
    }

    const { postId, parentId, body } = parsed.data;

    const post = await db.post.findUnique({
        where: { id: postId },
        select: { id: true, slug: true },
    });
    if (!post) return { error: "Post not found" };

    let resolvedParentId: string | null = null;
    if (parentId) {
        const parent = await db.comment.findUnique({
            where: { id: parentId },
            select: { id: true, parentId: true, postId: true },
        });
        if (!parent || parent.postId !== postId) {
            return { error: "That comment no longer exists" };
        }
        // Flatten: a reply to a reply attaches to the top-level comment.
        resolvedParentId = parent.parentId ?? parent.id;
    }

    const comment = await db.comment.create({
        data: { postId, parentId: resolvedParentId, authorId: user.id, body },
        include: { author: { select: publicUserSelect } },
    });

    revalidatePath(`/post/${post.slug}`);

    return { success: true, comment };
};

export const editComment = async (id: string, body: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const trimmed = body.trim();
    if (!trimmed) return { error: "Comment can't be empty" };
    if (trimmed.length > 2000) return { error: "Keep it under 2000 characters" };

    const comment = await db.comment.findUnique({
        where: { id },
        select: { authorId: true, post: { select: { slug: true } } },
    });
    if (!comment) return { error: "Comment not found" };
    if (comment.authorId !== user.id) {
        return { error: "You can only edit your own comments" };
    }

    await db.comment.update({ where: { id }, data: { body: trimmed } });
    revalidatePath(`/post/${comment.post.slug}`);

    return { success: true };
};

/**
 * Soft-delete a comment. Author or ADMIN only.
 *
 * A parent with replies is kept as a tombstone rather than removed, so the
 * replies underneath it don't lose their context.
 */
export const deleteComment = async (id: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const comment = await db.comment.findUnique({
        where: { id },
        select: {
            authorId: true,
            post: { select: { slug: true } },
            _count: { select: { replies: true } },
        },
    });
    if (!comment) return { error: "Comment not found" };

    const isOwner = comment.authorId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) {
        return { error: "You can only delete your own comments" };
    }

    if (comment._count.replies > 0) {
        // Keep the node so its thread survives; blank the content.
        await db.comment.update({
            where: { id },
            data: { deletedAt: new Date(), body: "[deleted]" },
        });
    } else {
        await db.comment.delete({ where: { id } });
    }

    revalidatePath(`/post/${comment.post.slug}`);
    return { success: true };
};
