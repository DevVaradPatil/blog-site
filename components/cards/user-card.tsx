import type { PublicUser } from "@/lib/selects";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FaUser } from "react-icons/fa";

type UserCardProps = {
  user: PublicUser;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <Link
      href={`/user/${user.id}`}
      className="w-[550px] xs:w-full flex justify-start items-center py-1 px-2 rounded-md transition-all duration-200 hover:bg-neutral-100 cursor-pointer"
    >
      <Avatar className="w-20 h-20">
        <AvatarImage
          src={user.image || ""}
          className="w-full h-full object-cover"
        />
        <AvatarFallback className="bg-sky-500">
          <FaUser className="text-white" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col justify-start items-start ml-3">
        <h1 className="font-medium">{user.name}</h1>
        {user.bio && (
          <p className="text-sm text-neutral-500 line-clamp-2">{user.bio}</p>
        )}
      </div>
    </Link>
  );
};

export default UserCard;
