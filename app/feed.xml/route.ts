import { getFeed } from "@/data/post";
import { absoluteUrl, siteDescription, siteName, siteUrl } from "@/lib/site";

export const revalidate = 3600;

/** Minimal XML escaping for text nodes and attribute values. */
const escapeXml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

/**
 * RSS 2.0 feed of published write-ups.
 *
 * Excerpts only — the point is to bring readers to the post, and the full
 * Tiptap body would need HTML serialisation that the reader may not honour.
 */
export async function GET() {
    const { posts } = await getFeed({ take: 30 });

    const items = posts
        .map((post) => {
            const url = absoluteUrl(`/post/${post.slug}`);
            const published = (post.publishedAt ?? post.createdAt).toUTCString();

            return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${published}</pubDate>
      <dc:creator>${escapeXml(post.author.name ?? "Anonymous")}</dc:creator>
      <description>${escapeXml(post.excerpt ?? "")}</description>
${post.tags
                    .map((t) => `      <category>${escapeXml(t.tag.name)}</category>`)
                    .join("\n")}
    </item>`;
        })
        .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteName)}</title>
    <link>${escapeXml(siteUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
        },
    });
}
