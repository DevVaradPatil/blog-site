import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BsGithub, BsLinkedin } from "react-icons/bs";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import UserAvatar from "@/components/user-avatar";
import EmptyState from "@/components/empty-state";
import { getPublicProfileWithStats } from "@/data/user";
import { getPostsByUserId } from "@/data/post";
import { currentUser } from "@/lib/auth";
import { isFollowing } from "@/actions/follow-actions";
import FollowButton from "@/components/follow-button";
import { longDate, plural } from "@/lib/format";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const user = await getPublicProfileWithStats(params.id);

  if (!user) return { title: "Profile not found" };

  return {
    title: user.name ?? "Profile",
    description: user.bio ?? `Write-ups by ${user.name}.`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const user = await getPublicProfileWithStats(params.id);

  if (!user) notFound();

  const [posts, viewer, following] = await Promise.all([
    getPostsByUserId(params.id).then((p) => p ?? []),
    currentUser(),
    isFollowing(params.id),
  ]);

  const isSelf = viewer?.id === params.id;

  const stats = [
    { label: "Posts", value: user._count.posts },
    { label: "Followers", value: user._count.followers },
    { label: "Following", value: user._count.following },
  ];

  return (
    <AppShell>
      <Container width="wide" className="py-12">
        <header className="flex flex-col gap-6 border-b border-rule pb-10 sm:flex-row sm:items-start">
          <UserAvatar
            name={user.name}
            src={user.image}
            className="h-24 w-24 shrink-0 sm:h-28 sm:w-28"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {user.name ?? "Anonymous"}
              </h1>

              {viewer && !isSelf && (
                <FollowButton targetId={params.id} initialFollowing={following} />
              )}
            </div>

            {user.bio && (
              <p className="mt-3 max-w-prose text-lg text-muted-foreground">
                {user.bio}
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
              <div className="flex items-baseline gap-1.5">
                <dt>Joined</dt>
                <dd className="text-foreground">{longDate(user.createdAt)}</dd>
              </div>
            </dl>

            {(user.github || user.linkedin) && (
              <div className="mt-5 flex items-center gap-3">
                {user.github && (
                  <Link
                    href={user.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${user.name} on GitHub`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <BsGithub size={20} />
                  </Link>
                )}
                {user.linkedin && (
                  <Link
                    href={user.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${user.name} on LinkedIn`}
                    className="text-muted-foreground transition-colors hover:text-[#0A66C2]"
                  >
                    <BsLinkedin size={20} />
                  </Link>
                )}
              </div>
            )}
          </div>
        </header>

        <section className="mt-10">
          <h2 className="mb-6 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
            {plural(posts.length, "write-up")}
          </h2>

          {posts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nothing published yet"
              description={`${user.name} hasn't posted a write-up.`}
            />
          )}
        </section>
      </Container>
    </AppShell>
  );
}
