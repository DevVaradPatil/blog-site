"use client";
import HomeBar from "@/components/homebar";
import LoadingSpinner from "@/components/loading-spinner";
import UserProfile from "@/components/user-profile";
import UserProfileGlobal from "@/components/user-profile-global";
import { fetchPublicProfile } from "@/actions/public-queries";
import type { PublicUser } from "@/lib/selects";
import { Post } from "@prisma/client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const UserProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<Post[] | null>([]);
  useEffect(() => {
    const fetchUser = async () => {
      const profile = await fetchPublicProfile(id.toString());
      setUser(profile?.user ?? null);
      setPosts(profile?.posts ?? []);
    };
    fetchUser();
  }, [id]);
  return (
    <div className="w-full min-h-screen items-start justify-center flex bg-slate-100">
      <HomeBar />
      {user && posts ? (
        <UserProfileGlobal user={user} posts={posts} />
      ) : (
        <div className="flex justify-center items-center w-full h-screen">
            <LoadingSpinner message="Finiding user profile"/>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
