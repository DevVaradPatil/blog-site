import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import UserAvatar from "@/components/user-avatar";
import EmptyState from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchPosts } from "@/data/post";
import { searchPublicUsersByName } from "@/data/user";
import { plural } from "@/lib/format";

export const metadata: Metadata = {
  title: "Search",
  description: "Search student project write-ups and authors.",
};

/**
 * Search is URL-driven rather than client state, so a result set can be
 * linked, shared and reloaded. It also means the query runs on the server
 * instead of shipping results through a client action on every keystroke.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q?.trim() ?? "";

  const [posts, users] = query
    ? await Promise.all([
        searchPosts(query).then((r) => r ?? []),
        searchPublicUsersByName(query).then((r) => r ?? []),
      ])
    : [[], []];

  const hasResults = posts.length > 0 || users.length > 0;

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <h1 className="text-4xl font-bold tracking-tight">Search</h1>

        <form action="/search" method="get" className="mt-6 flex max-w-xl gap-2">
          <Input
            name="q"
            defaultValue={query}
            placeholder="Try: PID control, retinopathy, offline first"
            aria-label="Search write-ups and authors"
            className="h-11"
          />
          <Button type="submit" size="lg">
            <SearchIcon className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">Search</span>
          </Button>
        </form>

        <p className="mt-3 font-mono text-2xs uppercase text-muted-foreground">
          Full-text search — phrases in quotes, <code>-word</code> to exclude
        </p>

        {!query && (
          <EmptyState
            className="mt-12"
            title="Search the archive"
            description="Look for a technique, a component, a mistake someone else already made."
            icon={<SearchIcon className="h-8 w-8" />}
          />
        )}

        {query && !hasResults && (
          <EmptyState
            className="mt-12"
            title={`Nothing matches "${query}"`}
            description="Every term has to appear. Try fewer words, or a different one."
            action={{ label: "Browse everything", href: "/home" }}
          />
        )}

        {users.length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              {plural(users.length, "author")}
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <li key={user.id}>
                  <Link
                    href={`/user/${user.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-signal"
                  >
                    <UserAvatar
                      name={user.name}
                      src={user.image}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{user.name}</p>
                      {user.bio && (
                        <p className="truncate text-sm text-muted-foreground">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {posts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              {plural(posts.length, "write-up")} — ranked by relevance
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </AppShell>
  );
}
