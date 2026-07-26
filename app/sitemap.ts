import type { MetadataRoute } from "next";

import { getAllPostSlugs, getPopularTags } from "@/data/post";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [posts, tags] = await Promise.all([
        getAllPostSlugs(),
        getPopularTags(100),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: siteUrl, changeFrequency: "daily", priority: 1 },
        { url: `${siteUrl}/home`, changeFrequency: "daily", priority: 0.9 },
        { url: `${siteUrl}/search`, changeFrequency: "monthly", priority: 0.3 },
    ];

    // Only published posts reach here — `getAllPostSlugs` filters on status,
    // so drafts are never advertised to crawlers.
    const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
        url: `${siteUrl}/post/${post.slug}`,
        lastModified: post.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    const tagRoutes: MetadataRoute.Sitemap = tags.map((tag) => ({
        url: `${siteUrl}/tag/${tag.slug}`,
        changeFrequency: "weekly",
        priority: 0.5,
    }));

    return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
