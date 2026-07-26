import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { JSONContent } from "@tiptap/react";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostEditor from "@/components/editor/post-editor";
import { currentUser } from "@/lib/auth";
import { getPostBySlug } from "@/data/post";
import { getEditablePost } from "@/actions/save-post";

export const metadata: Metadata = { title: "Edit post" };

/**
 * Editing a post — the feature that didn't exist until now. Previously you
 * could create a post and delete it, but never change one.
 */
export default async function EditPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const user = await currentUser();

  if (!user?.id) redirect("/auth/login");

  const post = await getPostBySlug(params.slug);

  if (!post) notFound();

  // Re-fetch through the ownership-checked loader rather than trusting the
  // public query, so a non-owner can't reach the editor by URL.
  const editable = await getEditablePost(post.id);

  if (!editable) {
    redirect(`/post/${post.slug}`);
  }

  return (
    <AppShell>
      <Container width="feed" className="py-10">
        <header className="mb-8">
          <p className="label text-signal">Editing</p>
          <h1 className="mt-3 text-3xl font-bold">Revise your write-up</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Published changes go live immediately.{" "}
            <Link
              href={`/post/${post.slug}`}
              className="text-signal underline underline-offset-2"
            >
              View the post
            </Link>
          </p>
        </header>

        <PostEditor
          initial={{
            id: editable.id,
            title: editable.title,
            contentJson: (editable.contentJson as JSONContent | null) ?? null,
            coverImage: editable.coverImage,
            coverImageId: editable.coverImageId,
            tags: editable.tags.map((t) => t.tag.name),
            link: editable.link ?? "",
            status: editable.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          }}
        />
      </Container>
    </AppShell>
  );
}
