import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import EmptyState from "@/components/empty-state";
import { currentUser } from "@/lib/auth";
import { getFollowingFeed } from "@/data/post";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Following" };

export default async function FollowingPage() {
  const user = await currentUser();
  if (!user?.id) redirect("/auth/login?callbackUrl=/following");

  const posts = await getFollowingFeed(user.id);

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="border-b border-rule pb-6">
          <h1 className="text-4xl font-bold">Following</h1>
          <p className="label mt-2">
            {posts.length > 0
              ? plural(posts.length, "recent write-up")
              : "From the authors you follow"}
          </p>
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
            title="Your feed is empty"
            description="Follow a few authors and their new write-ups will collect here."
            action={{ label: "Find authors", href: "/home" }}
          />
        )}
      </Container>
    </AppShell>
  );
}
