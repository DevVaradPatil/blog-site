"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ChevronUp } from "lucide-react";

import { toggleUpvote } from "@/actions/post-actions";
import type { FlourishHandle } from "./upvote-flourish";
import { cn } from "@/lib/utils";

// Loaded on demand — see the note in upvote-flourish.tsx. Until it arrives a
// plain chevron stands in, so the control is usable immediately.
const UpvoteFlourish = dynamic(() => import("./upvote-flourish"), {
  ssr: false,
  loading: () => <ChevronUp className="h-5 w-5" />,
});

type UpvoteButtonProps = {
  upvotes: number;
  id: string;
  initialHasUpvoted?: boolean;
};

const UpvoteButton = ({ upvotes, id, initialHasUpvoted = false }: UpvoteButtonProps) => {
  const flourishRef = useRef<FlourishHandle>(null);

  const [totalUpvotes, setTotalUpvotes] = useState(upvotes);
  const [voted, setVoted] = useState(initialHasUpvoted);
  const [pending, setPending] = useState(false);

  const handleUpvoteClick = async () => {
    if (pending) return;
    if (!voted) flourishRef.current?.play();

    // Optimistic toggle, reconciled with the server's authoritative count.
    const previous = { total: totalUpvotes, voted };
    setVoted(!voted);
    setTotalUpvotes((current) => current + (voted ? -1 : 1));
    setPending(true);

    const result = await toggleUpvote(id);
    setPending(false);

    if (result.error) {
      setTotalUpvotes(previous.total);
      setVoted(previous.voted);
      toast.error(result.error);
      return;
    }

    if (typeof result.upvotes === "number") {
      setTotalUpvotes(result.upvotes);
      setVoted(Boolean(result.hasUpvoted));
    }
  };

  return (
    // A real <button>: the previous version was a div with onClick, so it
    // couldn't be reached or activated from the keyboard.
    <button
      type="button"
      onClick={handleUpvoteClick}
      aria-pressed={voted}
      aria-label={voted ? "Remove your upvote" : "Upvote this write-up"}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border px-4 py-2 transition-colors",
        "disabled:opacity-60",
        voted
          ? "border-signal bg-signal/10 text-signal"
          : "border-border text-muted-foreground hover:border-signal/50 hover:text-foreground",
      )}
    >
      <UpvoteFlourish />
      <span data-numeric className="font-mono text-sm">
        {totalUpvotes}
      </span>
      <span className="font-mono text-2xs uppercase tracking-wider">
        {voted ? "Upvoted" : "Upvote"}
      </span>
    </button>
  );
};

export default UpvoteButton;
