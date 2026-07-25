"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { CreatePostSchema } from "@/schemas";
import { currentUser } from "@/lib/auth";
import {
    buildExcerpt,
    estimateReadingTime,
    slugifyTag,
    slugifyTitle,
    uniqueSlug,
} from "@/lib/post-utils";

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

    const slug = await uniqueSlug(
        slugifyTitle(title),
        async (candidate) =>
            (await db.post.count({ where: { slug: candidate } })) > 0,
    );

    // Collapse "Next.js" / "nextjs" onto one tag row, dropping blanks.
    const tagRows = Array.from(
        new Map(
            (tags ?? [])
                .map((raw) => raw.trim())
                .filter(Boolean)
                .map((raw) => [slugifyTag(raw), raw] as const)
                .filter(([slugged]) => slugged.length > 0),
        ).entries(),
    );

    const post = await db.post.create({
        data: {
            slug,
            title,
            content,
            excerpt: buildExcerpt(content),
            readingTime: estimateReadingTime(content),
            authorId: user.id,
            link,
            images: image ? [image] : [],
            coverImage: image ?? null,
            status: "PUBLISHED",
            publishedAt: new Date(),
            tags: {
                create: tagRows.map(([slugged, name]) => ({
                    tag: {
                        connectOrCreate: {
                            where: { slug: slugged },
                            create: { slug: slugged, name },
                        },
                    },
                })),
            },
        },
    });

    revalidatePath("/home");

    return { success: "Post Created!", slug: post.slug };
}
