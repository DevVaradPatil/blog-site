"use server";

import { revalidatePath } from "next/cache";

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Persist a new avatar URL for the signed-in user.
 *
 * The previous version always returned `false` — it returned from inside a
 * `.then()` callback while the outer function fell through to `return false`,
 * so callers could never tell a success from a failure.
 */
export const profileImage = async (imgUrl: string | undefined) => {
    const user = await currentUser();

    if (!user?.id) {
        return { error: "Unauthorized" };
    }

    if (!imgUrl) {
        return { error: "No image provided" };
    }

    try {
        await db.user.update({
            where: { id: user.id },
            data: { image: imgUrl },
        });

        revalidatePath("/profile");

        return { success: "Profile picture updated" };
    } catch (error) {
        console.error("Failed to update profile image:", error);
        return { error: "Could not update profile picture" };
    }
}
