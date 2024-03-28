"use client";

import { updatePostUpvotesById } from "@/data/post";
import { useRef, useState } from "react";
import { Player } from "@lordicon/react";

type UpvoteButtonProps = {
  upvotes: number;
  id: string;
};

const ICON = require("@/assets/applause.json");

const UpvoteButton = ({ upvotes, id }: UpvoteButtonProps) => {
  const playerRef = useRef<Player>(null);
  
  const [totalUpvotes, setTotalUpvotes] = useState(upvotes);

  const handleUpvoteClick = async () => {
    playerRef.current?.playFromBeginning();
    const random = Math.floor(Math.random() * 3) + 1;
    setTotalUpvotes(totalUpvotes + random);
    await updatePostUpvotesById(id, random);
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
