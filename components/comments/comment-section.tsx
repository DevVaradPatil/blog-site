import Link from "next/link";

import type { PublicUser } from "@/lib/selects";
import { currentUser } from "@/lib/auth";
import { plural } from "@/lib/format";
import CommentForm from "./comment-form";
import CommentItem, { type CommentNode } from "./comment-item";

type ThreadComment = CommentNode & { replies: CommentNode[] };

type CommentSectionProps = {
    postId: string;
    comments: ThreadComment[];
};

/**
 * Server component orchestrating the thread — reads the viewer once, then hands
 * the client comment items what they need to show owner controls.
 */
const CommentSection = async ({ postId, comments }: CommentSectionProps) => {
    const viewer = await currentUser();
    const total = comments.reduce((n, c) => n + 1 + c.replies.length, 0);

    return (
        <section>
            <h2 className="label mb-6">{plural(total, "response")}</h2>

            {viewer ? (
                <CommentForm postId={postId} />
            ) : (
                <p className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
                    <Link href="/auth/login" className="text-signal hover:underline">
                        Sign in
                    </Link>{" "}
                    to join the discussion.
                </p>
            )}

            <div className="mt-8 space-y-8">
                {comments.map((comment) => (
                    <div key={comment.id}>
                        <CommentItem
                            comment={comment}
                            postId={postId}
                            currentUserId={viewer?.id}
                            isAdmin={viewer?.role === "ADMIN"}
                        />

                        {comment.replies.length > 0 && (
                            <div className="ml-4 mt-4 space-y-5 border-l border-border pl-6">
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        postId={postId}
                                        currentUserId={viewer?.id}
                                        isAdmin={viewer?.role === "ADMIN"}
                                        canReply={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CommentSection;
