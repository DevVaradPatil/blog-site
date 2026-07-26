import type { Metadata } from "next";

import AppShell from "@/components/layout/app-shell";
import Container from "@/components/layout/container";
import PostEditor from "@/components/editor/post-editor";

export const metadata: Metadata = { title: "Write a post" };

const CreatePost = () => (
  <AppShell>
    <Container width="feed" className="py-10">
      <header className="mb-8">
        <p className="label text-signal">New write-up</p>
        <h1 className="mt-3 text-3xl font-bold">Start writing</h1>
        <p className="mt-2 text-muted-foreground">
          Drafts save automatically. Nothing is public until you publish.
        </p>
      </header>

      <PostEditor />
    </Container>
  </AppShell>
);

export default CreatePost;
