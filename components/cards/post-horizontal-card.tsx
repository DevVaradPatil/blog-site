import { Post } from "@prisma/client";
import Link from "next/link";
import { MdDelete } from "react-icons/md";
import DeleteButton from "../delete-button";

type PostHorizontalCardProps = {
  post: Post;
  isInsideProfile?: boolean;
};

const PostHorizontalCard = ({post, isInsideProfile}: PostHorizontalCardProps) => {
  const postDate = new Date(post.createdAt);
  const currentDate = new Date();
  const timeDifference = currentDate.getTime() - postDate.getTime();

  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  let timeAgo = "";

  if (months > 0) {
    timeAgo = `${months} month${months > 1 ? "s" : ""} ago`;
  } else if (days > 0) {
    timeAgo = `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    timeAgo = `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    timeAgo = `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    timeAgo = `${seconds} second${seconds > 1 ? "s" : ""} ago`;
  }

  return (
    <div className="relative flex">
      {post && isInsideProfile && (
        <DeleteButton id={post.id}/>
      )}
    <Link href={`/post/${post.id}`} className="flex my-2 items-center space-y-2 space-x-2 bg-white border border-neutral-200 rounded-md p-3 w-[550px] xs:w-full">
      {post.images.length > 0 && (
        <div className="w-16 h-16 rounded-md flex justify-center items-center overflow-hidden">
          <img
            src={post.images[0]}
            alt="post_img"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex flex-col w-full">
        <p className="font-medium text-neutral-900">
          {post.title.length > 40
            ? post.title.slice(0, 40) + "..."
            : post.title}
        </p>
        <p className="text-[12px] mt-1 text-neutral-700">
        {post.content.length > 100
          ? post.content.slice(0, 100) + "..."
          : post.content}
        </p>
        <p>
          <span className="text-[12px] text-neutral-500">{timeAgo}</span>
        </p>
      </div>
    </Link>
    </div>
  );
};

export default PostHorizontalCard;
