"use client";

import { toggleUpvote } from "@/actions/post-actions";
import { useRef, useState } from "react";
import { Player } from "@lordicon/react";
import { toast } from "sonner";

type UpvoteButtonProps = {
  upvotes: number;
  id: string;
  initialHasUpvoted?: boolean;
};

const ICON = require("@/assets/applause.json");

const UpvoteButton = ({ upvotes, id, initialHasUpvoted = false }: UpvoteButtonProps) => {
  const playerRef = useRef<Player>(null);

  const [totalUpvotes, setTotalUpvotes] = useState(upvotes);
  const [voted, setVoted] = useState(initialHasUpvoted);

  const handleUpvoteClick = async () => {
    if (!voted) playerRef.current?.playFromBeginning();

    // Optimistic toggle, reconciled with the server's authoritative count.
    const previous = { total: totalUpvotes, voted };
    setVoted(!voted);
    setTotalUpvotes((current) => current + (voted ? -1 : 1));

    const result = await toggleUpvote(id);

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
    <div
      className={`flex cursor-pointer justify-center items-center w-full py-1 gap-2 rounded-md border  transition-all duration-200  ${
        totalUpvotes > 0
          ? "border-green-300 hover:bg-green-300/60 text-green-600"
          : "border-neutral-200 hover:bg-secondary/80"
      }`}
      onClick={handleUpvoteClick}
    >
      <p>{totalUpvotes > 0 && totalUpvotes}</p>
      <p>{totalUpvotes > 0 ? "Upvotes" : "Upvote"}</p>
      <div>
        <Player ref={playerRef} icon={ICON} colorize="#16a34a" size={24} />
      </div>
    </div>
  );
};

export default UpvoteButton;
