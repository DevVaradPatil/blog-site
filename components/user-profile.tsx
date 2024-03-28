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
import { User } from "@prisma/client";
import LoadingSpinner from "./loading-spinner";

interface UserProfileProps {
  user?: ExtendedUser;
}

const UserProfile = ({ user }: UserProfileProps) => {
  const [userImage, setUserImage] = useState<string | null>(user?.image || null);
  const [isLoading, setIsLoading] = useState(false);
  const handleProfileImage = async (e: any) => {
    
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target!.result as string);
      };
      reader.readAsDataURL(file);
      const newImageUrl = await handleUpload(file);
      const isUserUpdated = await profileImage(newImageUrl);
      if (isUserUpdated) {
        setUserImage(newImageUrl!);
      }
      else{
        setUserImage(user?.image || null);
        setUserImage(newImageUrl!)
      }
      setIsLoading(false);
    }
  }
  return (
    <div className="flex flex-col p-3 mt-[150px] xs:mt-[20px] w-[600px] xs:w-[95vw] xs:mb-[80px] bg-white rounded-lg shadow-md relative">
      <Link href={'/settings'} className="absolute right-5 top-5 p-2 rounded-md bg-slate-200/50 border border-gray-100 transition-all duration-200 hover:opacity-70 cursor-pointer">
        <MdModeEdit className="text-lg" />
      </Link>
      <div className="flex items-center xs:flex-col xs:space-y-2 xs:text-center space-x-4 justify-start border-b border-b-gray-400 pb-2">
        <Avatar className="h-40 w-40 xs:h-32 xs:w-32 relative">
          <AvatarImage src={userImage || ""} className="w-full h-full object-cover"/>
          
          {isLoading && <div className="absolute inset-0 bg-black/50 flex justify-center items-center w-full h-full"><LoadingSpinner/></div>}

          <label htmlFor="avatar-upload" className="absolute bottom-0 py-1 w-full flex justify-center items-center cursor-pointer bg-neutral-600/60">
            <input id="avatar-upload" type="file" className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" onChange={(e) => handleProfileImage(e)}/>
            <MdModeEdit className="text-white text-xl"/>
            </label>
          <AvatarFallback className="bg-sky-500">
            <FaUser className="text-white" size={50} />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col space-y-1">
          <h1 className="text-3xl xs:text-2xl font-bold text-slate-900">
            {user?.name || "Anonymous"}
          </h1>
          <p className="text-lg xs:text-base text-slate-700">{user?.email || "No email"}</p>
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
      {user?.posts?.length === 0 ? (
              <p>No posts yet.</p> 
            ) : (
              user?.posts?.map((post) => (
                  <PostHorizontalCard key={post.id} post={post} isInsideProfile />
              ))
            )}
      </div>
      </div>
    </div>
  );
};

export default UserProfile;
