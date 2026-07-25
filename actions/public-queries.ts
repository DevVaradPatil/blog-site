"use server";

import { getPostById, getPostsByUserId, searchPosts } from "@/data/post";
import { getPublicUserById, searchPublicUsersByName } from "@/data/user";

/**
 * The deliberate public read surface for client components.
 *
 * Everything here returns data that is safe for anonymous callers. User records
 * come back through `publicUserSelect`, so password hashes and email addresses
 * never leave the server.
 */

export const fetchPostWithAuthor = async (id: string) => {
    const post = await getPostById(id);

    if (!post) {
        return null;
    }

    // The author now travels with the post via `postWithMetaInclude`.
    return { post, author: post.author };
}

export const fetchPublicProfile = async (id: string) => {
    const user = await getPublicUserById(id);

    if (!user) {
        return null;
    }

    const posts = await getPostsByUserId(id);

    return { user, posts: posts ?? [] };
}

export const searchContent = async (query: string) => {
    const trimmed = query.trim();

    if (!trimmed) {
        return { users: [], posts: [] };
    }

    const [users, posts] = await Promise.all([
        searchPublicUsersByName(trimmed),
        searchPosts(trimmed),
    ]);

    return { users: users ?? [], posts: posts ?? [] };
}
