import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Authenticated and single-user surfaces carry nothing worth
            // indexing, and /api would leak endpoint shapes into search.
            disallow: [
                "/api/",
                "/auth/",
                "/settings",
                "/profile",
                "/create-post",
                "/bookmarks",
                "/following",
                "/design",
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
