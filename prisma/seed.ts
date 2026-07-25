/**
 * Seeds Think Tank with curated users, posts, tags, comments and votes.
 *
 * Idempotent: re-running wipes and rebuilds the same content, so you can drop
 * new cover images into seed/images/posts and run it again to attach them.
 *
 *   npx tsx --env-file=.env prisma/seed.ts          # refuses if rows exist
 *   npx tsx --env-file=.env prisma/seed.ts --yes    # confirms the wipe
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readdirSync } from "fs";
import { join } from "path";
import { v2 as cloudinary } from "cloudinary";

import {
    seedComments,
    seedPosts,
    seedUsers,
    type Block,
} from "./seed-data";

const db = new PrismaClient();

const IMAGE_DIR = join(process.cwd(), "seed", "images", "posts");
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"];
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "thinktank2026";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

// ---------------------------------------------------------------- content ---

/** Renders authored blocks as a Tiptap document. */
const toTiptap = (blocks: Block[]) => ({
    type: "doc",
    content: blocks.map((block) => {
        switch (block.type) {
            case "h2":
                return {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: block.text }],
                };
            case "ul":
                return {
                    type: "bulletList",
                    content: block.items.map((item) => ({
                        type: "listItem",
                        content: [
                            { type: "paragraph", content: [{ type: "text", text: item }] },
                        ],
                    })),
                };
            case "quote":
                return {
                    type: "blockquote",
                    content: [
                        { type: "paragraph", content: [{ type: "text", text: block.text }] },
                    ],
                };
            case "code":
                return {
                    type: "codeBlock",
                    attrs: { language: block.language },
                    content: [{ type: "text", text: block.text }],
                };
            default:
                return {
                    type: "paragraph",
                    content: [{ type: "text", text: block.text }],
                };
        }
    }),
});

/** Flattens blocks to plain text — feeds the search vector and the excerpt. */
const toPlainText = (blocks: Block[]): string =>
    blocks
        .map((block) => {
            if (block.type === "ul") return block.items.join(" ");
            return block.text;
        })
        .join("\n\n");

// Duplicated from lib/post-utils so the seed can run as a standalone script
// without pulling in the "@/" path alias.
const slugifyTitle = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
const slugifyTag = (tag: string) => tag.toLowerCase().replace(/[^a-z0-9]+/g, "");
const buildExcerpt = (content: string, length = 200) => {
    const flat = content.replace(/\s+/g, " ").trim();
    if (flat.length <= length) return flat;
    return flat.slice(0, flat.lastIndexOf(" ", length) || length).trimEnd() + "…";
};
const estimateReadingTime = (content: string) =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).filter(Boolean).length / 200));

// ----------------------------------------------------------------- images ---

const findLocalImage = (base: string): string | null => {
    let entries: string[];
    try {
        entries = readdirSync(IMAGE_DIR);
    } catch {
        return null;
    }

    const match = entries.find((file) =>
        IMAGE_EXTENSIONS.some((ext) => file.toLowerCase() === `${base}${ext}`),
    );

    return match ? join(IMAGE_DIR, match) : null;
};

const uploadCover = async (base: string) => {
    const path = findLocalImage(base);

    if (!path) return null;

    const result = await cloudinary.uploader.upload(path, {
        folder: "thinktank/posts",
        public_id: base,
        overwrite: true,
        transformation: [
            { width: 2000, height: 2000, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
        ],
    });

    return { url: result.secure_url as string, publicId: result.public_id as string };
};

// ------------------------------------------------------------------- wipe ---

const currentCounts = async () => ({
    users: await db.user.count(),
    posts: await db.post.count(),
    comments: await db.comment.count(),
    tags: await db.tag.count(),
});

const wipe = async () => {
    // Explicit order rather than relying purely on cascades, so the intent is
    // readable and the script does not depend on FK configuration.
    await db.comment.deleteMany();
    await db.upvote.deleteMany();
    await db.bookmark.deleteMany();
    await db.follow.deleteMany();
    await db.postTag.deleteMany();
    await db.post.deleteMany();
    await db.tag.deleteMany();
    await db.account.deleteMany();
    await db.twoFactorConfirmation.deleteMany();
    await db.user.deleteMany();
    await db.verificationToken.deleteMany();
    await db.passwordResetToken.deleteMany();
    await db.twoFactorToken.deleteMany();
};

// ------------------------------------------------------------------- main ---

const main = async () => {
    const before = await currentCounts();
    const hasData = Object.values(before).some((n) => n > 0);
    const confirmed = process.argv.includes("--yes");

    console.log("Current database:", before);

    if (hasData && !confirmed) {
        console.error(
            "\nThis will DELETE the rows above and replace them with seed content." +
            "\nRe-run with --yes to confirm.",
        );
        process.exitCode = 1;
        return;
    }

    console.log("\nWiping…");
    await wipe();

    console.log("Creating users…");
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const usersByKey = new Map<string, string>();

    for (const user of seedUsers) {
        const created = await db.user.create({
            data: {
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                github: user.github,
                linkedin: user.linkedin,
                emailVerified: new Date(),
                // Only the admin gets credentials; the rest are display-only
                // authors with no way to sign in.
                password: user.role === "ADMIN" ? hashed : null,
            },
        });
        usersByKey.set(user.key, created.id);
    }
    console.log(`  ${usersByKey.size} users`);

    console.log("Creating posts…");
    const postsByImage = new Map<string, string>();
    let uploaded = 0;
    let gradient = 0;

    for (const post of seedPosts) {
        const authorId = usersByKey.get(post.authorKey)!;
        const content = toPlainText(post.body);
        const publishedAt = new Date(Date.now() - post.daysAgo * 86_400_000);
        const cover = await uploadCover(post.image);

        if (cover) uploaded++;
        else gradient++;

        const created = await db.post.create({
            data: {
                slug: slugifyTitle(post.title),
                title: post.title,
                content,
                contentJson: toTiptap(post.body) as any,
                excerpt: buildExcerpt(content),
                readingTime: estimateReadingTime(content),
                coverImage: cover?.url ?? null,
                coverImageId: cover?.publicId ?? null,
                images: cover ? [cover.url] : [],
                link: post.link,
                status: "PUBLISHED",
                publishedAt,
                createdAt: publishedAt,
                authorId,
                tags: {
                    create: post.tags.map((name) => ({
                        tag: {
                            connectOrCreate: {
                                where: { slug: slugifyTag(name) },
                                create: { slug: slugifyTag(name), name },
                            },
                        },
                    })),
                },
            },
        });

        postsByImage.set(post.image, created.id);
    }
    console.log(`  ${postsByImage.size} posts — ${uploaded} with uploaded covers, ${gradient} using gradients`);

    console.log("Creating comments…");
    let commentCount = 0;
    for (const thread of seedComments) {
        const postId = postsByImage.get(thread.postImage);
        if (!postId) continue;

        const parent = await db.comment.create({
            data: {
                body: thread.body,
                postId,
                authorId: usersByKey.get(thread.authorKey)!,
            },
        });
        commentCount++;

        for (const reply of thread.replies ?? []) {
            await db.comment.create({
                data: {
                    body: reply.body,
                    postId,
                    authorId: usersByKey.get(reply.authorKey)!,
                    parentId: parent.id,
                },
            });
            commentCount++;
        }
    }
    console.log(`  ${commentCount} comments`);

    console.log("Creating upvotes…");
    const userIds = Array.from(usersByKey.values());
    const postIds = Array.from(postsByImage.values());
    let voteCount = 0;

    for (let index = 0; index < postIds.length; index++) {
        // Deterministic spread so the feed shows varied counts without
        // every post looking identical.
        const voters = userIds.filter((_, i) => (i + index) % 3 !== 0);
        for (const userId of voters.slice(0, 3 + (index % 5))) {
            await db.upvote.create({ data: { userId, postId: postIds[index] } });
            voteCount++;
        }
    }
    console.log(`  ${voteCount} upvotes`);

    console.log("Creating follows and bookmarks…");
    let followCount = 0;
    for (let i = 0; i < userIds.length; i++) {
        const followerId = userIds[i];
        const targets = userIds.filter((id, j) => id !== followerId && (i + j) % 3 === 0);
        for (const followingId of targets) {
            await db.follow.create({ data: { followerId, followingId } });
            followCount++;
        }
    }

    let bookmarkCount = 0;
    for (let i = 0; i < userIds.length; i++) {
        const saved = postIds.filter((_, j) => (i + j) % 5 === 0);
        for (const postId of saved) {
            await db.bookmark.create({ data: { userId: userIds[i], postId } });
            bookmarkCount++;
        }
    }
    console.log(`  ${followCount} follows, ${bookmarkCount} bookmarks`);

    console.log("\nDone:", await currentCounts());
    console.log(`\nAdmin login: ${seedUsers.find((u) => u.role === "ADMIN")!.email} / ${ADMIN_PASSWORD}`);
};

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await db.$disconnect();
    });
