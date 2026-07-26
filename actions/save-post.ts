"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PostEditorSchema } from "@/schemas";
import { deleteImage } from "@/lib/storage";
import {
    buildExcerpt,
    estimateReadingTime,
    slugifyTag,
    slugifyTitle,
    tiptapToText,
    uniqueSlug,
} from "@/lib/post-utils";

type EditorInput = z.infer<typeof PostEditorSchema>;

/**
 * Create or update a post.
 *
 * One action for both so the editor doesn't have to know whether it's drafting
 * something new or revising something published — the presence of `id` decides.
 */
export const savePost = async (values: EditorInput) => {
    const user = await currentUser();

    if (!user?.id) {
        return { error: "Sign in to save" };
    }

    const parsed = PostEditorSchema.safeParse(values);

    if (!parsed.success) {
        return { error: parsed.error.errors[0]?.message ?? "Invalid fields" };
    }

    const { id, title, contentJson, coverImage, coverImageId, tags, link, status } =
        parsed.data;

    const content = tiptapToText(contentJson);

    if (status === "PUBLISHED" && content.trim().length === 0) {
        return { error: "Write something before publishing" };
    }

    // Collapse "Next.js" / "nextjs" onto one tag row, dropping blanks.
    const tagRows = Array.from(
        new Map(
            tags
                .map((raw) => raw.trim())
                .filter(Boolean)
                .map((raw) => [slugifyTag(raw), raw] as const)
                .filter(([slugged]) => slugged.length > 0),
        ).entries(),
    );

    const shared = {
        title,
        content,
        contentJson,
        excerpt: buildExcerpt(content),
        readingTime: estimateReadingTime(content),
        coverImage: coverImage ?? null,
        coverImageId: coverImageId ?? null,
        link: link || null,
        status,
    };

    try {
        if (id) {
            const existing = await db.post.findUnique({
                where: { id },
                select: {
                    id: true,
                    authorId: true,
                    slug: true,
                    status: true,
                    publishedAt: true,
                    coverImageId: true,
                },
            });

            if (!existing) return { error: "Post not found" };

            const isOwner = existing.authorId === user.id;
            const isAdmin = user.role === UserRole.ADMIN;

            if (!isOwner && !isAdmin) {
                return { error: "You can only edit your own posts" };
            }

            // A published post keeps its slug — links to it already exist.
            // Drafts re-derive from the title until they go live.
            const slug =
                existing.status === "PUBLISHED"
                    ? existing.slug
                    : await uniqueSlug(slugifyTitle(title), async (candidate) =>
                          candidate !== existing.slug &&
                          (await db.post.count({ where: { slug: candidate } })) > 0,
                      );

            const post = await db.post.update({
                where: { id },
                data: {
                    ...shared,
                    slug,
                    publishedAt:
                        status === "PUBLISHED"
                            ? existing.publishedAt ?? new Date()
                            : existing.publishedAt,
                    tags: {
                        deleteMany: {},
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
                select: { id: true, slug: true, status: true },
            });

            // Clean up a replaced cover so orphans don't accrue in storage.
            if (existing.coverImageId && existing.coverImageId !== coverImageId) {
                await deleteImage(existing.coverImageId);
            }

            revalidatePath("/home");
            revalidatePath("/profile");
            revalidatePath(`/post/${post.slug}`);

            return { success: "Saved", id: post.id, slug: post.slug, status: post.status };
        }

        const slug = await uniqueSlug(
            slugifyTitle(title),
            async (candidate) =>
                (await db.post.count({ where: { slug: candidate } })) > 0,
        );

        const post = await db.post.create({
            data: {
                ...shared,
                slug,
                authorId: user.id,
                publishedAt: status === "PUBLISHED" ? new Date() : null,
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
            select: { id: true, slug: true, status: true },
        });

        revalidatePath("/home");
        revalidatePath("/profile");

        return { success: "Saved", id: post.id, slug: post.slug, status: post.status };
    } catch (error) {
        console.error("savePost failed:", error);
        return { error: "Could not save. Try again." };
    }
};

/** Loads a post for editing, enforcing ownership. */
export const getEditablePost = async (id: string) => {
    const user = await currentUser();

    if (!user?.id) return null;

    const post = await db.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } },
    });

    if (!post) return null;

    const isOwner = post.authorId === user.id;
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isOwner && !isAdmin) return null;

    return post;
};
