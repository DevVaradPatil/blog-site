"use client";
import ShareButton from "@/components/share-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import UpvoteButton from "@/components/upvote-button";
import { getPostById } from "@/data/post";
import { getUserById } from "@/data/user";
import { Post, User } from "@prisma/client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";

const PostPage = () => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [timeAgo, setTimeAgo] = useState("");
  useEffect(() => {
    const fetchPost = async () => {
      const postData = await getPostById(id.toString());
      setPost(postData);
      const userData = await getUserById(postData?.authorId!);
      setUser(userData);
    };
    fetchPost();
  }, [id]);

  useEffect(() => {
    if (post) {
      const postDate = new Date(post.createdAt);
      const currentDate = new Date();
      const timeDifference = currentDate.getTime() - postDate.getTime();

      const seconds = Math.floor(timeDifference / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const months = Math.floor(days / 30);

      if (months > 0) {
        setTimeAgo(`${months} month${months > 1 ? "s" : ""} ago`);
      } else if (days > 0) {
        setTimeAgo(`${days} day${days > 1 ? "s" : ""} ago`);
      } else if (hours > 0) {
        setTimeAgo(`${hours} hour${hours > 1 ? "s" : ""} ago`);
      } else if (minutes > 0) {
        setTimeAgo(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
      } else {
        setTimeAgo(`${seconds} second${seconds > 1 ? "s" : ""} ago`);
      }
    }
  }, [post]);
  return (
    <div className="w-full py-3 xs:px-3 min-h-screen bg-gray-100 justify-center items-center">
      <div className="w-3/4 xs:w-full mx-auto bg-white p-8 xs:p-4 rounded-md shadow-md">
        <h1 className="text-4xl font-bold mb-4 text-neutral-900">
          {post?.title}
        </h1>
        <div className="w-full justify-between items-center">
          <div className="flex justify-between w-full items-center mb-2">
            <Link
              href={`/user/${user?.id}`}
              className="flex justify-start items-center gap-2"
            >
              <Avatar className="w-14 h-14">
                <AvatarImage
                  src={user?.image || ""}
                  className="w-full h-full object-cover"
                />
                <AvatarFallback className="bg-sky-500">
                  <FaUser className="text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                {user && (
                  <div className="flex flex-col">
                    <h3 className="font-medium">{user.name}</h3>
                    <h3 className="text-sm text-neutral-700 truncate">{user.email}</h3>
                  </div>
                )}
                <p className="text-[12px] font-light text-neutral-500">
                  {timeAgo}
                </p>
              </div>
            </Link>
            {post?.link && (
              <Link href={post.link} target="_blank">
                <Button variant="outline">
                  View Live <FaArrowUpRightFromSquare className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
        {post && (
          <div className="flex w-full py-2 gap-2">
            <UpvoteButton upvotes={post?.upvotes!} id={post?.id!} />
            <ShareButton
              shareLink={`http://localhost:3000/post/${post?.id!}`}
            />
          </div>
        )}
        <div className="w-full h-full">
          {post && post.images.length > 0 && (
            <div className="h-[400px] xs:h-fit border-t border-t-neutral-300 py-1">
              <img
                src={post.images[0]}
                alt={post.content}
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>
        <p className="mt-3">{post?.content}</p>
      </div>
    </div>
  );
};

export default PostPage;
