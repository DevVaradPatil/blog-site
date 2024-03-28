import { ExtendedUser } from "@/next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaUser } from "react-icons/fa";
import { MdModeEdit } from "react-icons/md";
import PostHorizontalCard from "./cards/post-horizontal-card";
import Link from "next/link";
import { Button } from "./ui/button";
import { BsGithub, BsLinkedin } from "react-icons/bs";
import { useState } from "react";
import { profileImage } from "@/actions/profileImage";
import { handleUpload } from "@/actions/handleImageUpload";
import { Post, User } from "@prisma/client";

interface UserProfileGlobalProps {
  user?: User;
  posts? : Post[]
}

const UserProfileGlobal = ({ user, posts }: UserProfileGlobalProps) => {
  
  return (
    <div className="flex flex-col p-3 mt-[150px] xs:mt-[20px] xs:mb-[80px] w-[600px] xs:w-[95vw] bg-white rounded-lg shadow-md relative">
      <div className="flex xs:flex-col items-center space-x-4 justify-start border-b border-b-gray-400 pb-2">
        <Avatar className="h-40 w-40 xs:w-32 xs:h-32 relative">
          <AvatarImage src={user?.image || ""} className="w-full h-full object-cover"/>
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" size={50} />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl xs:text-2xl xs:text-center font-bold text-slate-900">
            {user?.name || "Anonymous"}
          </h1>
          <p className="text-lg xs:text-base xs:text-center text-slate-700">{user?.email || "No email"}</p>
          <div className="flex items-center xs:justify-center space-x-2">
            {user?.linkedin && (
              <Link href={user?.linkedin} target="_blank">
                  <BsLinkedin size={22} className="text-[#0A66C2] hover:opacity-70 transition-all duration-200"/>
              </Link>
            )}
            {user?.github && (
              <Link href={user?.github} target="_blank">
                  <BsGithub size={22} className="hover:opacity-70 transition-all duration-200"/>
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="py-3 flex space-y-2 flex-col justify-center items-center w-full">
      <div className="flex flex-col space-y-1 justify-start items-start w-full px-2">
        <h2 className="text-xl xs:text-lg font-semibold text-slate-900">About Me</h2>
        <p className="text-slate-800">{user?.bio || "No bio"}</p>
      </div>
      <div className="w-full h-px bg-gray-400"/>
      <div className="flex justify-start items-start text-left w-full">
        <Button variant="outline" className="rounded-full">
          Posts
        </Button>
      </div>
      <div className="flex flex-col">
      {posts?.length === 0 ? (
              <p>No posts yet.</p> 
            ) : (
              posts?.map((post) => (
                  <PostHorizontalCard key={post.id} post={post} />
              ))
            )}
      </div>
      </div>
    </div>
  );
};

export default UserProfileGlobal;
