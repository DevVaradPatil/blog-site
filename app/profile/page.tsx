"use client";

import dynamic from 'next/dynamic';
import { useCurrentUser } from "@/hooks/use-current-user";

// Dynamically import components with SSR disabled
const DynamicHomeBar = dynamic(() => import('@/components/homebar'), { ssr: false });
const DynamicUserProfile = dynamic(() => import('@/components/user-profile'), { ssr: false });

const Profile = () => {
  const user = useCurrentUser();

  return (
    <div className="w-full min-h-screen items-start justify-center flex bg-slate-100">
      <DynamicHomeBar />
      {user && <DynamicUserProfile user={user} />}
    </div>
  );
};

export default Profile;
