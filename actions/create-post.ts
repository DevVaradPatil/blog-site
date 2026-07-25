"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { CreatePostSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";

export const createPost = async (values: z.infer<typeof CreatePostSchema>) => {
    // The author is taken from the session, never from the request body.
    // Previously `authorId` arrived from the client, which let any caller
    // publish a post as any user.
    const user = await currentUser();

    if (!user?.id) {
        return { error: "Unauthorized" };
    }

    const validatedFields = CreatePostSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { title, content, image, tags, link } = validatedFields.data;

    await db.post.create({
        data: {
            title,
            content,
            authorId: user.id,
            tags: tags ?? [],
            link,
            images: image ? [image] : [],
        }
    });

    revalidatePath("/home");

    return { success: "Post Created!" };
}
