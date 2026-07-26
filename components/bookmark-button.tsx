"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { toggleBookmark } from "@/actions/bookmark-actions";
import { cn } from "@/lib/utils";

type BookmarkButtonProps = {
    postId: string;
    initialBookmarked: boolean;
    /** `icon` for a bare toggle, `full` for a labelled button. */
    variant?: "icon" | "full";
};

const BookmarkButton = ({
    postId,
    initialBookmarked,
    variant = "full",
}: BookmarkButtonProps) => {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [pending, startTransition] = useTransition();

    const toggle = () => {
        const previous = bookmarked;
        setBookmarked(!previous); // optimistic

        startTransition(async () => {
            const result = await toggleBookmark(postId);
            if (result.error) {
                setBookmarked(previous);
                toast.error(result.error);
                return;
            }
            setBookmarked(Boolean(result.bookmarked));
        });
    };

    if (variant === "icon") {
        return (
            <button
                type="button"
                onClick={toggle}
                disabled={pending}
                aria-pressed={bookmarked}
                aria-label={bookmarked ? "Remove bookmark" : "Save post"}
                className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors",
                    bookmarked
                        ? "border-signal bg-signal/10 text-signal"
                        : "border-border text-muted-foreground hover:text-foreground",
                )}
            >
                <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
            </button>
        );
    }

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={pending}
            aria-pressed={bookmarked}
            className={cn(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 transition-colors",
                bookmarked
                    ? "border-signal bg-signal/10 text-signal"
                    : "border-border text-muted-foreground hover:border-signal/50 hover:text-foreground",
            )}
        >
            <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
            <span className="label">{bookmarked ? "Saved" : "Save"}</span>
        </button>
    );
};

export default BookmarkButton;
