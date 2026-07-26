import Link from "next/link";
import { ArrowRight } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCard from "@/components/cards/post-card";
import UserAvatar from "@/components/user-avatar";
import EmptyState from "@/components/empty-state";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getFeaturedPost, getFeed, getPopularTags } from "@/data/post";
import { getTopContributors } from "@/data/user";
import { plural } from "@/lib/format";

export const revalidate = 300;

export default async function LandingPage() {
  const [featured, tags, contributors] = await Promise.all([
    getFeaturedPost(),
    getPopularTags(10),
    getTopContributors(6),
  ]);

  // Skip the featured post so the grid doesn't repeat it.
  const { posts, total } = await getFeed({ take: featured ? 7 : 6 });
  const recent = posts.filter((p) => p.id !== featured?.id).slice(0, 6);

  return (
    <AppShell glow>
      {/* Hero — the thesis is the work itself, so the newest write-up leads. */}
      <Container width="wide" className="pt-20 pb-16 lg:pt-28">
        <Reveal className="max-w-3xl" y={20}>
          <p className="label text-signal">Student engineering, written down</p>
          <h1 className="mt-6 text-5xl font-bold leading-[1.02] lg:text-7xl">
            The parts that
            <br />
            didn&apos;t work either.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Project write-ups by students who show the decisions, the dead ends,
            and the thing that finally made it run. Not portfolios — reports.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="group">
              <Link href="/home">
                Start reading
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/create-post">Publish yours</Link>
            </Button>
          </div>
        </Reveal>
      </Container>

      {featured ? (
        <Container width="wide" className="border-t border-rule py-16">
          <Reveal>
            <PostCard post={featured} featured priority />
          </Reveal>
        </Container>
      ) : null}

      {/* Browse by tag */}
      {tags.length > 0 && (
        <Container width="wide" className="border-t border-rule py-12">
          <Reveal>
            <h2 className="label">Browse by subject</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    href={`/tag/${tag.slug}`}
                    className="inline-flex items-baseline gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm transition-all hover:-translate-y-0.5 hover:border-signal/60 hover:text-signal"
                  >
                    {tag.slug}
                    <span data-numeric className="text-2xs text-muted-foreground">
                      {tag._count.posts}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </Container>
      )}

      {/* Recent work */}
      <Container width="wide" className="border-t border-rule py-16">
        <Reveal className="mb-9 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold">Recent write-ups</h2>
            <p className="label mt-2">{plural(total, "published post")}</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="group shrink-0">
            <Link href="/home">
              See all
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </Reveal>

        {recent.length > 0 ? (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((post) => (
              <StaggerItem key={post.id}>
                <PostCard post={post} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <EmptyState
            title="Nothing published yet"
            description="The first write-up will show up here."
            action={{ label: "Write the first one", href: "/create-post" }}
          />
        )}
      </Container>

      {/* Contributors */}
      {contributors.length > 0 && (
        <Container width="wide" className="border-t border-rule py-16">
          <Reveal>
            <h2 className="label">Who writes here</h2>
          </Reveal>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contributors.map((person) => (
              <StaggerItem key={person.id}>
                <Link
                  href={`/user/${person.id}`}
                  className="flex h-full items-start gap-3 rounded-xl border border-transparent p-4 transition-colors hover:border-border hover:bg-card"
                >
                  <UserAvatar
                    name={person.name}
                    src={person.image}
                    className="h-11 w-11 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium">{person.name}</p>
                    <p className="label mt-0.5">
                      {plural(person._count.posts, "post")}
                    </p>
                    {person.bio && (
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                        {person.bio}
                      </p>
                    )}
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      )}
    </AppShell>
  );
}
