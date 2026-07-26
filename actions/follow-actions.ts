"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

/**
 * Toggle following another user. Guards against following yourself.
 */
export const toggleFollow = async (targetId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Sign in to follow" };
    if (user.id === targetId) return { error: "You can't follow yourself" };

    try {
        const existing = await db.follow.findUnique({
            where: {
                followerId_followingId: { followerId: user.id, followingId: targetId },
            },
            select: { id: true },
        });

        if (existing) {
            await db.follow.delete({ where: { id: existing.id } });
        } else {
            await db.follow.create({
                data: { followerId: user.id, followingId: targetId },
            });
        }

        revalidatePath(`/user/${targetId}`);
        revalidatePath("/following");

        return { success: true, following: !existing };
    } catch {
        return { error: "Could not update follow" };
    }
};

export const isFollowing = async (targetId: string) => {
    const user = await currentUser();
    if (!user?.id || user.id === targetId) return false;

    const row = await db.follow.findUnique({
        where: {
            followerId_followingId: { followerId: user.id, followingId: targetId },
        },
        select: { id: true },
    });
    return Boolean(row);
};
