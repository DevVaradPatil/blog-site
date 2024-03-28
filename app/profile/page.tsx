"use client";
import HomeBar from "@/components/homebar";
import UserProfile from "@/components/user-profile";
import { useCurrentUser } from "@/hooks/use-current-user";

const Profile = () => {
    const user = useCurrentUser();
  return (
    <div className="w-full min-h-screen items-start justify-center flex bg-slate-100">
        <HomeBar/>
        {user && <UserProfile user={user} />}
    </div>
  )
} 

export default Profile