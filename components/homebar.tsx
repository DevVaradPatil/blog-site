"use client";

import UserButton from "@/components/auth/user-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiCog6Tooth,
  HiMagnifyingGlass,
  HiMiniHome,
  HiPlus,
} from "react-icons/hi2";

const HomeBar = () => {
  const pathname = usePathname();
  return (
    <>
      <div className="w-full flex justify-center items-center bg-transparent fixed top-8 z-50 xs:hidden">
        <div className="bg-white flex justify-between items-center p-4 rounded-xl w-[600px] shadow-md">
          <div className="flex gap-x-2">
            <Button
              asChild
              variant={pathname === "/home" ? "default" : "outline"}
            >
              <Link href="/home" className="space-x-2">
                <HiMiniHome />
                <p>Home</p>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/search" ? "default" : "outline"}
            >
              <Link href="/search" className="space-x-2">
                <HiMagnifyingGlass />
                <p>Search</p>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/create-post" ? "default" : "outline"}
            >
              <Link href="/create-post" className="space-x-2">
                <HiPlus />
                <p>Create Post</p>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/settings" ? "default" : "outline"}
            >
              <Link href="/settings" className="space-x-2">
                <HiCog6Tooth />
                <p>Settings</p>
              </Link>
            </Button>
          </div>

          <UserButton />
        </div>
      </div>
      <div className="w-full justify-center items-center bg-transparent fixed bottom-0 z-50 hidden xs:flex">
        <div className="bg-white flex justify-between items-center px-3 py-1 pt-3 rounded-t-xl border border-b-0 border-neutral-200 w-screen shadow-md">
          <div className="flex gap-x-2 w-full h-14 justify-evenly">
            <Button
              asChild
              variant={pathname === "/home" ? "default" : "outline"}
              className="h-full w-full"
            >
              <Link href="/home" className="space-x-2">
                <HiMiniHome size={20}/>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/search" ? "default" : "outline"}
              className="h-full w-full"
            >
              <Link href="/search" className="space-x-2">
                <HiMagnifyingGlass size={20}/>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/create-post" ? "default" : "outline"}
              className="h-full w-full"
            >
              <Link href="/create-post" className="space-x-2">
                <HiPlus size={20}/>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname === "/settings" ? "default" : "outline"}
              className="h-full w-full"
            >
              <Link href="/settings" className="space-x-2">
                <HiCog6Tooth size={20}/>
              </Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomeBar;
