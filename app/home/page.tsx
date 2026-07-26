import Link from "next/link";
import type { Metadata } from "next";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { getFeed, getPopularTags, type FeedSort } from "@/data/post";
import { cn } from "@/lib/utils";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Read",
  description: "Project write-ups from students — newest, most upvoted, most discussed.",
};

const PAGE_SIZE = 12;

const SORTS: { key: FeedSort; label: string }[] = [
  { key: "latest", label: "Latest" },
  { key: "top", label: "Most upvoted" },
  { key: "discussed", label: "Most discussed" },
];

type SearchParams = { sort?: string; tag?: string; page?: string };

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sort = (SORTS.find((s) => s.key === searchParams.sort)?.key ??
    "latest") as FeedSort;
  const tag = searchParams.tag;
  const page = Math.max(1, Number(searchParams.page) || 1);

  const [{ posts, total }, tags] = await Promise.all([
    getFeed({ sort, tag, take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    getPopularTags(14),
  ]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  /** Builds a feed URL preserving the filters that aren't being changed. */
  const feedHref = (next: Partial<SearchParams>) => {
    const params = new URLSearchParams();
    const merged = { sort, tag, page: String(page), ...next };
    if (merged.sort && merged.sort !== "latest") params.set("sort", merged.sort);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.page && merged.page !== "1") params.set("page", merged.page);
    const qs = params.toString();
    return qs ? `/home?${qs}` : "/home";
  };

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="border-b border-rule pb-6">
          <h1 className="text-4xl font-bold tracking-tight">
            {tag ? `#${tag}` : "Everything"}
          </h1>
          <p className="mt-2 font-mono text-2xs uppercase text-muted-foreground">
            {plural(total, "write-up")}
            {tag && " tagged"}
          </p>
        </header>

        {/* Sort */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {SORTS.map((option) => (
            <Link
              key={option.key}
              href={feedHref({ sort: option.key, page: "1" })}
              className={cn(
                "rounded-md border px-3 py-1.5 font-mono text-2xs uppercase tracking-wider transition-colors",
                option.key === sort
                  ? "border-signal bg-signal/10 text-signal"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </Link>
          ))}

          {tag && (
            <Link
              href={feedHref({ tag: undefined, page: "1" })}
              className="ml-auto font-mono text-2xs uppercase text-muted-foreground hover:text-signal"
            >
              Clear filter ✕
            </Link>
          )}
        </div>

        {/* Tag rail */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-b border-rule pb-6">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={feedHref({ tag: t.slug === tag ? undefined : t.slug, page: "1" })}
              className={cn(
                "rounded px-2 py-1 font-mono text-2xs transition-colors",
                t.slug === tag
                  ? "bg-signal text-signal-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {t.slug}
            </Link>
          ))}
        </div>

        {posts.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} priority={i < 3} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title={tag ? `Nothing tagged #${tag} yet` : "No write-ups yet"}
            description={
              tag
                ? "Try another subject, or publish the first one."
                : "Be the first to publish here."
            }
            action={{ label: "Write a post", href: "/create-post" }}
          />
        )}

        {pageCount > 1 && (
          <nav
            className="mt-12 flex items-center justify-between border-t border-rule pt-6"
            aria-label="Pagination"
          >
            <Button asChild variant="outline" size="sm" disabled={page <= 1}>
              <Link href={feedHref({ page: String(page - 1) })} aria-disabled={page <= 1}>
                ← Newer
              </Link>
            </Button>
            <span className="font-mono text-2xs uppercase text-muted-foreground">
              Page <span data-numeric>{page}</span> of{" "}
              <span data-numeric>{pageCount}</span>
            </span>
            <Button asChild variant="outline" size="sm" disabled={page >= pageCount}>
              <Link
                href={feedHref({ page: String(page + 1) })}
                aria-disabled={page >= pageCount}
              >
                Older →
              </Link>
            </Button>
          </nav>
        )}
      </Container>
    </AppShell>
  );
}
