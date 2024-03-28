"use client";

import React, { useState } from "react";
import { FaUser } from "react-icons/fa6";
import { HiMiniHome, HiPhone, HiMiniInformationCircle } from "react-icons/hi2";
import { LoginButton } from "../auth/login-button";
import { Button } from "../ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type NavbarProps = {
  isSignedIn: boolean;
  userImg: string | null | undefined;
};

const Navbar = ({ isSignedIn, userImg }: NavbarProps) => {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex flex-col fixed top-0 left-0 w-full z-50">
      <nav className="bg-white  p-4 xs:p-3 px-10 xs:px-3 flex items-center justify-between ">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 xs:hidden">
            Blog It
          </h1>
        </div>
        <div className="flex xs:hidden space-x-10 text-base font-medium">
          <Link
            href="/home"
            className={`transition flex items-center gap-1 duration-300 text-neutral-800 hover:text-blue-600`}
          >
            <HiMiniHome className="text-lg" /> Home
          </Link>
          <Link
            href="/about"
            className={`transition flex items-center gap-1 duration-300 text-neutral-800 hover:text-blue-600`}
          >
            <HiMiniInformationCircle className="text-lg" />
            About
          </Link>
          <Link
            href="/contact"
            className={`transition flex items-center gap-1 duration-300 text-neutral-800 hover:text-blue-600`}
          >
            <HiPhone />
            Contact
          </Link>
          {!isSignedIn ? (
            <div>
              <LoginButton asChild>
                <Button variant="default" size="lg">
                  Sign in
                </Button>
              </LoginButton>
            </div>
          ) : (
            <Link href="/client">
              <Avatar>
                <AvatarImage src={userImg || ""} />
                <AvatarFallback className="bg-sky-500">
                  <FaUser className="text-white" />
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
        </div>

        <div
          className="xs:block hidden cursor-pointer"
          onClick={toggleMobileSidebar}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </div>
        {/* For mobile view sidebar */}
        <div
          className={`xs:block hidden fixed top-0 right-0 h-full w-52 pt-10 bg-white shadow-lg transform ${
            isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out border-l border-l-gray-300`}
        >
          {/* Close button */}
          <div
            className="cursor-pointer absolute top-4 right-4"
            onClick={closeMobileSidebar}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>

          <div className="p-4 mt-4 space-y-4">
            <Link
              href="/"
              className={`pb-2 border-b flex items-center gap-2 border-b-gray-400 text-neutral-800 hover:text-blue-600 transition duration-300`}
              onClick={closeMobileSidebar}
            >
              <HiMiniHome className="text-lg" />
              Home
            </Link>
            <Link
              href="/about"
              className={`pb-2 border-b flex items-center gap-2 border-b-gray-400 text-neutral-800 hover:text-blue-600 transition duration-300`}
              onClick={closeMobileSidebar}
            >
              <HiMiniInformationCircle className="text-lg" />
              About
            </Link>
            <Link
              href="/contact"
              className={`pb-2 border-b flex items-center gap-2 border-b-gray-400 text-neutral-800 hover:text-blue-600 transition duration-300 `}
              onClick={closeMobileSidebar}
            >
              <HiPhone />
              Contact
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
