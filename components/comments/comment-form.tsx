"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addComment } from "@/actions/comment-actions";

type CommentFormProps = {
    postId: string;
    parentId?: string;
    autoFocus?: boolean;
    placeholder?: string;
    onDone?: () => void;
    compact?: boolean;
};

const CommentForm = ({
    postId,
    parentId,
    autoFocus,
    placeholder = "Add to the discussion…",
    onDone,
    compact,
}: CommentFormProps) => {
    const router = useRouter();
    const [body, setBody] = useState("");
    const [pending, startTransition] = useTransition();

    const submit = () => {
        if (!body.trim()) return;

        startTransition(async () => {
            const result = await addComment({ postId, parentId, body });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            setBody("");
            router.refresh();
            onDone?.();
        });
    };

    return (
        <div className={compact ? "" : "rounded-xl border border-border bg-card p-4"}>
            <Textarea
                value={body}
                autoFocus={autoFocus}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => {
                    // ⌘/Ctrl+Enter submits, matching the rest of the app's forms.
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
                }}
                placeholder={placeholder}
                rows={compact ? 2 : 3}
                className="resize-none"
            />
            <div className="mt-2 flex items-center justify-end gap-2">
                {onDone && (
                    <Button type="button" variant="ghost" size="sm" onClick={onDone}>
                        Cancel
                    </Button>
                )}
                <Button
                    type="button"
                    size="sm"
                    onClick={submit}
                    disabled={pending || !body.trim()}
                >
                    {pending ? "Posting…" : parentId ? "Reply" : "Comment"}
                </Button>
            </div>
        </div>
    );
};

export default CommentForm;
