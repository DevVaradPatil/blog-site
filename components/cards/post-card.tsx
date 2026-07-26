import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";

import type { PostWithMeta } from "@/lib/selects";
import { isoDate, longDate } from "@/lib/format";
import PostCover from "../post-cover";
import UserAvatar from "../user-avatar";
import DeleteButton from "../delete-button";
import HoverLift from "../motion/hover-lift";

type PostCardProps = {
  post: PostWithMeta;
  /** The lead slot on the landing page — wider, with the cover alongside. */
  featured?: boolean;
  priority?: boolean;
  /** Shows owner controls. Only set where the viewer owns the post. */
  owned?: boolean;
};

const PostCard = ({
  post,
  featured = false,
  priority = false,
  owned = false,
}: PostCardProps) => {
  const href = `/post/${post.slug}`;

  if (featured) {
    return (
      <article className="group grid gap-8 md:grid-cols-2 md:items-center">
        <Link href={href} className="block overflow-hidden rounded-lg">
          <PostCover
            seed={post.id}
            title={post.title}
            src={post.coverImage}
            priority={priority}
            sizes="(max-width: 768px) 100vw, 560px"
            className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </Link>

        <div>
          <p className="font-mono text-2xs uppercase tracking-wider text-signal">
            Latest
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
            <Link href={href} className="hover:underline decoration-2 underline-offset-4">
              {post.title}
            </Link>
          </h2>
          <p className="mt-4 text-base text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <UserAvatar name={post.author.name} src={post.author.image} className="h-9 w-9" />
            {/* Author name keeps its natural case; only the metadata around
                it is set as uppercase mono. */}
            <div className="font-mono text-2xs text-muted-foreground">
              <Link
                href={`/user/${post.author.id}`}
                className="text-sm font-sans font-medium text-foreground hover:text-signal"
              >
                {post.author.name}
              </Link>
              <span className="mx-2">·</span>
              <time
                className="uppercase"
                dateTime={isoDate(post.publishedAt ?? post.createdAt)}
              >
                {longDate(post.publishedAt ?? post.createdAt)}
              </time>
              <span className="mx-2">·</span>
              <span data-numeric className="uppercase">{post.readingTime} min</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <HoverLift className="h-full">
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:shadow-lifted">
      {owned && (
        <div className="absolute right-3 top-3 z-10 flex gap-1.5">
          <Link
            href={`/post/${post.slug}/edit`}
            aria-label={`Edit "${post.title}"`}
            className="rounded-md border border-border bg-background/80 p-1.5 text-muted-foreground backdrop-blur transition-colors hover:border-signal hover:text-signal"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <DeleteButton id={post.id} title={post.title} />
        </div>
      )}

      <Link href={href} className="block overflow-hidden">
        <PostCover
          seed={post.id}
          title={post.title}
          src={post.coverImage}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
          className="aspect-[16/10] w-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="label flex flex-wrap items-center gap-x-2 gap-y-1">
          {post.tags.slice(0, 2).map(({ tag }) => (
            <Link
              key={tag.id}
              href={`/tag/${tag.slug}`}
              className="text-signal transition-colors hover:text-signal/70"
            >
              {tag.slug}
            </Link>
          ))}
          {post.tags.length > 0 && <span aria-hidden>·</span>}
          <span data-numeric>{post.readingTime} min</span>
        </div>

        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight">
          <Link href={href} className="hover:underline decoration-2 underline-offset-4">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>

        <footer className="mt-5 flex items-center justify-between border-t border-rule pt-4">
          <Link
            href={`/user/${post.author.id}`}
            className="flex items-center gap-2 text-sm hover:text-signal"
          >
            <UserAvatar name={post.author.name} src={post.author.image} className="h-7 w-7" />
            <span className="font-medium">{post.author.name}</span>
          </Link>

          <div className="flex items-center gap-3 font-mono text-2xs text-muted-foreground">
            <span data-numeric title={`${post._count.upvotes} upvotes`}>
              ▲ {post._count.upvotes}
            </span>
            <span data-numeric title={`${post._count.comments} comments`}>
              ✦ {post._count.comments}
            </span>
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-signal hover:underline"
                title="View the live project"
              >
                live <ArrowUpRight className="h-3 w-3" />
              </a>
            )}
          </div>
        </footer>
      </div>
    </article>
    </HoverLift>
  );
};

export default PostCard;
