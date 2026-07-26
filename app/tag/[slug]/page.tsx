import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import { getFeed, getPopularTags, getTagBySlug } from "@/data/post";
import { cn } from "@/lib/utils";
import { plural } from "@/lib/format";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug);

  if (!tag) return { title: "Tag not found" };

  return {
    title: `#${tag.slug}`,
    description: `Student project write-ups tagged ${tag.name}.`,
  };
}

export default async function TagPage({ params }: Props) {
  const tag = await getTagBySlug(params.slug);

  if (!tag) notFound();

  const [{ posts, total }, allTags] = await Promise.all([
    getFeed({ tag: params.slug, take: 24 }),
    getPopularTags(14),
  ]);

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="border-b border-rule pb-6">
          <p className="font-mono text-2xs uppercase tracking-wider text-signal">
            Subject
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">#{tag.slug}</h1>
          <p className="mt-2 font-mono text-2xs uppercase text-muted-foreground">
            {plural(total, "write-up")}
          </p>
        </header>

        <div className="mt-6 flex flex-wrap gap-1.5 border-b border-rule pb-6">
          {allTags.map((t) => (
            <Link
              key={t.id}
              href={`/tag/${t.slug}`}
              className={cn(
                "rounded px-2 py-1 font-mono text-2xs transition-colors",
                t.slug === tag.slug
                  ? "bg-signal text-signal-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.slug}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} priority={i < 3} />
          ))}
        </div>
      </Container>
    </AppShell>
  );
}
