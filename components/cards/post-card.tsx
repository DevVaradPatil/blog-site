import { getUserById } from "@/data/user";
import { Post } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  FaArrowUpRightFromSquare,
  FaHandsClapping,
  FaUser,
} from "react-icons/fa6";
import { Button } from "../ui/button";
import { currentUser } from "@/lib/auth";
import Link from "next/link";
import { MdIosShare } from "react-icons/md";
import { handleShare } from "@/actions/share";
import ShareButton from "../share-button";
import UpvoteButton from "../upvote-button";

type PostCardProps = {
  post: Post;
};

const PostCard = async (post: PostCardProps) => {
  const user = await currentUser();
  const author = await getUserById(post.post.authorId);
  const postDate = new Date(post.post.createdAt);
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
    <div className="flex flex-col space-y-2 shadow-5 bg-white border border-neutral-100 rounded-md p-3 w-[550px] xs:w-[95vw]">
      <div className="flex w-full justify-between items-center">
        <Link
          href={author?.id === user?.id ? `/profile` : `/user/${author?.id}`}
          className="flex gap-2 items-center"
        >
          <Avatar>
            <AvatarImage
              src={author?.image || ""}
              className="w-full h-full object-cover"
            />
            <AvatarFallback className="bg-sky-500">
              <FaUser className="text-white" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{author?.name!}</h3>
            <p className="text-sm font-light text-neutral-500">{timeAgo}</p>
          </div>
        </Link>
        {post.post.link && (
          <Link href={post.post.link} target="_blank">
            <Button variant="outline">
              View Live <FaArrowUpRightFromSquare className="ml-2" />
            </Button>
          </Link>
        )}
      </div>
      <Link href={`/post/${post.post.id}`} className="text-lg xs:text-base font-medium pt-1">
        {post.post.title.length > 80
          ? post.post.title.slice(0, 80) + "..."
          : post.post.title}
      </Link>
      <Link href={`/post/${post.post.id}`} className="xs:text-sm pb-2">
        {post.post.content.length > 170
          ? post.post.content.slice(0, 170) + "..."
          : post.post.content}
      </Link>
      {post.post.tags.length > 0 && (
        <div className="w-full pb-1 overflow-y-auto flex space-x-1 items-center justify-start">
          {post.post.tags.map((tag, index) => (
            <Link
              href={`/search/${tag
                .replace(/\s/g, "")
                .replace(/-/g, "")
                .toLowerCase()}`}
              key={index}
              className="px-2 py-1 w-fit flex justify-center items-center flex-row bg-neutral-100 text-neutral-800 rounded-md text-sm xs:text-[12px] hover:bg-neutral-200 cursor-pointer"
            >
              <span>#</span>
              <p>{tag.replace(/\s/g, "").replace(/-/g, "").toLowerCase()}</p>
            </Link>
          ))}
        </div>
      )}
      {post.post.images.length > 0 && (
        <Link
          href={`/post/${post.post.id}`}
          className="h-[400px] border-t border-t-neutral-300 py-1"
        >
          <img
            src={post.post.images[0]}
            alt={post.post.title}
            className="w-full h-full object-contain"
          />
        </Link>
      )}
      <div className="w-full flex items-center text-neutral-800 text-sm gap-1">
        <UpvoteButton upvotes={post.post.upvotes} id={post.post.id} />
        <ShareButton shareLink={`http://localhost:3000/post/${post.post.id}`} />
      </div>
    </div>
  );
};

export default PostCard;
