"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";

import type { PublicUser } from "@/lib/selects";
import { relativeTime, isoDate } from "@/lib/format";
import UserAvatar from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { editComment, deleteComment } from "@/actions/comment-actions";
import CommentForm from "./comment-form";

export type CommentNode = {
    id: string;
    body: string;
    createdAt: Date | string;
    deletedAt: Date | string | null;
    author: PublicUser;
};

type CommentItemProps = {
    comment: CommentNode;
    postId: string;
    currentUserId?: string;
    isAdmin?: boolean;
    /** Replies can't themselves be replied to — keeps threads two levels deep. */
    canReply?: boolean;
};

const CommentItem = ({
    comment,
    postId,
    currentUserId,
    isAdmin,
    canReply = true,
}: CommentItemProps) => {
    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [replying, setReplying] = useState(false);
    const [draft, setDraft] = useState(comment.body);
    const [pending, startTransition] = useTransition();

    const deleted = Boolean(comment.deletedAt);
    const isOwner = currentUserId === comment.author.id;
    const canModerate = isOwner || isAdmin;

    const saveEdit = () => {
        startTransition(async () => {
            const result = await editComment(comment.id, draft);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            setEditing(false);
            router.refresh();
        });
    };

    const remove = () => {
        startTransition(async () => {
            const result = await deleteComment(comment.id);
            if (result.error) {
                toast.error(result.error);
                return;
            }
            toast.success("Comment deleted");
            router.refresh();
        });
    };

    return (
        <div>
            <div className="flex items-start gap-3">
                <UserAvatar
                    name={comment.author.name}
                    src={comment.author.image}
                    className="h-8 w-8 shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {deleted ? (
                            <span className="text-sm font-medium text-muted-foreground">
                                [deleted]
                            </span>
                        ) : (
                            <Link
                                href={`/user/${comment.author.id}`}
                                className="text-sm font-medium hover:text-signal"
                            >
                                {comment.author.name}
                            </Link>
                        )}
                        <time
                            dateTime={isoDate(comment.createdAt)}
                            className="label"
                        >
                            {relativeTime(comment.createdAt)}
                        </time>

                        {canModerate && !deleted && (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    aria-label="Comment options"
                                    className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {isOwner && (
                                        <DropdownMenuItem onClick={() => setEditing(true)}>
                                            Edit
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        onClick={remove}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>

                    {editing ? (
                        <div className="mt-2">
                            <Textarea
                                value={draft}
                                onChange={(e) => setDraft(e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            <div className="mt-2 flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDraft(comment.body);
                                        setEditing(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={saveEdit} disabled={pending}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-1 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-foreground/90">
                            {comment.body}
                        </p>
                    )}

                    {canReply && !deleted && !editing && currentUserId && (
                        <button
                            type="button"
                            onClick={() => setReplying((v) => !v)}
                            className="mt-1.5 label hover:text-signal"
                        >
                            Reply
                        </button>
                    )}

                    {replying && (
                        <div className="mt-3">
                            <CommentForm
                                postId={postId}
                                parentId={comment.id}
                                autoFocus
                                compact
                                placeholder={`Reply to ${comment.author.name}…`}
                                onDone={() => setReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentItem;
