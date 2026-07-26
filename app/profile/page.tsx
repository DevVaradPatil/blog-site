import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import EmptyState from "@/components/empty-state";
import AvatarUploader from "@/components/avatar-uploader";
import { Button } from "@/components/ui/button";
import { currentUser } from "@/lib/auth";
import { getPublicProfileWithStats } from "@/data/user";
import { getPostsByUserId } from "@/data/post";
import { plural } from "@/lib/format";

export const metadata: Metadata = { title: "Your profile" };

/**
 * Previously a client component that rendered with `ssr: false` and read the
 * user's posts out of the session token. Both are gone: it renders on the
 * server and queries what it needs.
 */
export default async function ProfilePage() {
  const user = await currentUser();

  if (!user?.id) redirect("/auth/login");

  const [profile, posts] = await Promise.all([
    getPublicProfileWithStats(user.id),
    getPostsByUserId(user.id).then((p) => p ?? []),
  ]);

  if (!profile) redirect("/auth/login");

  const stats = [
    { label: "Posts", value: profile._count.posts },
    { label: "Followers", value: profile._count.followers },
    { label: "Following", value: profile._count.following },
  ];

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="flex flex-col gap-6 border-b border-rule pb-10 sm:flex-row sm:items-start">
          <AvatarUploader name={profile.name} src={profile.image} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {profile.name ?? "Anonymous"}
                </h1>
                <p className="mt-1 font-mono text-2xs uppercase text-muted-foreground">
                  {user.email}
                </p>
              </div>

              <Button asChild variant="outline" size="sm">
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit profile
                </Link>
              </Button>
            </div>

            {profile.bio ? (
              <p className="mt-4 max-w-prose text-lg text-muted-foreground">
                {profile.bio}
              </p>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No bio yet.{" "}
                <Link href="/settings" className="text-signal hover:underline">
                  Add one
                </Link>
                .
              </p>
            )}

            <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-2xs uppercase text-muted-foreground">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-baseline gap-1.5">
                  <dd data-numeric className="text-base font-medium text-foreground">
                    {stat.value}
                  </dd>
                  <dt>{stat.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              {plural(posts.length, "write-up")}
            </h2>
            <Button asChild size="sm">
              <Link href="/create-post">Write a post</Link>
            </Button>
          </div>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} owned />
              ))}
            </div>
          ) : (
            <EmptyState
              title="You haven't published anything"
              description="Write up a project — what you built, what broke, what you'd do differently."
              action={{ label: "Write your first post", href: "/create-post" }}
            />
          )}
        </section>
      </Container>
    </AppShell>
  );
}
