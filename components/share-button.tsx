"use client"
import { handleShare } from "@/actions/share";
import React from "react";
import { MdIosShare } from "react-icons/md";

type ShareButtonProps = {
    shareLink: string;
    };

const ShareButton = ({shareLink}: ShareButtonProps) => {
    const handleClick =async () => {
        await handleShare(shareLink);
    }
  return (
    <div
      className="flex cursor-pointer justify-center items-center w-full py-[0.4rem] gap-2 rounded-md border border-neutral-200 transition-all duration-200 hover:bg-secondary/80"
      onClick={handleClick}
    >
      <p>Share</p>
      <div>
        <MdIosShare size={16} />
      </div>
    </div>
  );
};

export default ShareButton;
