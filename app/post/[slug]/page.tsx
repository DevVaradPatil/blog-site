import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Pencil } from "lucide-react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostCover from "@/components/post-cover";
import SpecStrip from "@/components/spec-strip";
import UserAvatar from "@/components/user-avatar";
import ShareButton from "@/components/share-button";
import UpvoteButton from "@/components/upvote-button";
import BookmarkButton from "@/components/bookmark-button";
import ReadingProgress from "@/components/reading-progress";
import CommentSection from "@/components/comments/comment-section";
import TiptapRenderer from "@/components/content/tiptap-renderer";
import PostCard from "@/components/cards/post-card";
import { Button } from "@/components/ui/button";
import { getPostDetailBySlug, getRelatedPosts } from "@/data/post";
import { hasUpvoted } from "@/actions/post-actions";
import { hasBookmarked } from "@/actions/bookmark-actions";
import { currentUser } from "@/lib/auth";
import { isoDate, longDate } from "@/lib/format";

type Props = { params: { slug: string } };

/**
 * This page was a client component that fetched in `useEffect`, so it rendered
 * an empty shell to crawlers and had no per-post metadata. It is now server
 * rendered, which is what makes a post shareable and indexable.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostDetailBySlug(params.slug);

  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    authors: post.author.name ? [{ name: post.author.name }] : undefined,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt ?? undefined,
      publishedTime: (post.publishedAt ?? post.createdAt).toISOString(),
      authors: post.author.name ? [post.author.name] : undefined,
      images: post.coverImage ? [{ url: post.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await getPostDetailBySlug(params.slug);

  if (!post) notFound();

  const tagSlugs = post.tags.map((t) => t.tag.slug);
  const [related, upvoted, bookmarked, viewer] = await Promise.all([
    getRelatedPosts(post.id, tagSlugs),
    hasUpvoted(post.id),
    hasBookmarked(post.id),
    currentUser(),
  ]);

  const canEdit =
    viewer?.id === post.authorId || viewer?.role === "ADMIN";

  const published = post.publishedAt ?? post.createdAt;

  return (
    <AppShell>
      <ReadingProgress />

      <article>
        <Container width="reading" className="pt-12">
          <nav className="mb-8 flex items-center justify-between gap-4">
            <Link href="/home" className="label hover:text-signal">
              ← All write-ups
            </Link>

            {canEdit && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/post/${post.slug}/edit`}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            )}
          </nav>

          <header>
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tag/${tag.slug}`}
                  className="font-mono text-2xs uppercase tracking-wider text-signal hover:underline"
                >
                  #{tag.slug}
                </Link>
              ))}
            </div>

            <h1 className="mt-4 text-4xl font-bold leading-[1.1] tracking-tight lg:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-xl leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            {/* Metadata as a datasheet parameter table. */}
            <SpecStrip
              className="mt-8 border-y border-rule py-4"
              specs={[
                { label: "Author", value: post.author.name ?? "Anonymous" },
                {
                  label: "Published",
                  value: (
                    <time dateTime={isoDate(published)}>{longDate(published)}</time>
                  ),
                },
                { label: "Reading", value: `${post.readingTime} min` },
                {
                  label: "Responses",
                  value: <span data-numeric>{post._count.comments}</span>,
                },
              ]}
            />
          </header>
        </Container>

        <Container width="wide" className="py-10">
          <PostCover
            seed={post.id}
            title={post.title}
            src={post.coverImage}
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="mx-auto aspect-[2/1] w-full max-w-4xl rounded-lg"
          />
        </Container>

        <Container width="reading">
          <div className="prose-editorial">
            <TiptapRenderer content={post.contentJson} fallback={post.content} />
          </div>

          {post.link && (
            <div className="mt-10 rounded-lg border border-border bg-card p-5">
              <p className="font-mono text-2xs uppercase text-muted-foreground">
                Live project
              </p>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-medium text-signal hover:underline"
              >
                {post.link.replace(/^https?:\/\//, "")}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          )}

          {/* Reactions */}
          <div className="mt-10 flex flex-wrap items-center gap-3 border-y border-rule py-5">
            <UpvoteButton
              upvotes={post._count.upvotes}
              id={post.id}
              initialHasUpvoted={upvoted}
            />
            <BookmarkButton postId={post.id} initialBookmarked={bookmarked} />
            <ShareButton
              shareLink={`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/post/${post.slug}`}
            />
          </div>

          {/* Author */}
          <aside className="mt-10 flex items-start gap-4 rounded-lg border border-border bg-card p-6">
            <UserAvatar
              name={post.author.name}
              src={post.author.image}
              className="h-14 w-14 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-mono text-2xs uppercase text-muted-foreground">
                Written by
              </p>
              <Link
                href={`/user/${post.author.id}`}
                className="font-display text-lg font-semibold hover:text-signal"
              >
                {post.author.name}
              </Link>
              {post.author.bio && (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {post.author.bio}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/user/${post.author.id}`}>View profile</Link>
                </Button>
              </div>
            </div>
          </aside>

          <section className="mt-14">
            <CommentSection postId={post.id} comments={post.comments} />
          </section>
        </Container>

        {related.length > 0 && (
          <Container width="wide" className="mt-16 border-t border-rule py-12">
            <h2 className="mb-8 font-mono text-2xs uppercase tracking-wider text-muted-foreground">
              Related write-ups
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item: (typeof related)[number]) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </Container>
        )}
      </article>
    </AppShell>
  );
}
