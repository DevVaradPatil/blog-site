import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import EmptyState from "@/components/empty-state";
import { currentUser } from "@/lib/auth";
import { getBookmarkedPosts } from "@/data/post";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Saved" };

export default async function BookmarksPage() {
  const user = await currentUser();
  if (!user?.id) redirect("/auth/login?callbackUrl=/bookmarks");

  const posts = await getBookmarkedPosts(user.id);

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="border-b border-rule pb-6">
          <h1 className="text-4xl font-bold">Saved</h1>
          <p className="label mt-2">{plural(posts.length, "post")}</p>
        </header>

        {posts.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-10"
            title="Nothing saved yet"
            description="Tap Save on any write-up to keep it here for later."
            action={{ label: "Browse write-ups", href: "/home" }}
          />
        )}
      </Container>
    </AppShell>
  );
}
