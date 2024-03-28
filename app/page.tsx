"use client";
import { Poppins } from "next/font/google";
import Navbar from "@/components/shared/Navbar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import arm from '../assets/arm.gif'
import { useRouter } from "next/navigation";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export default function Home() {
  const user = useCurrentUser();
  const router = useRouter();
  const [isSignedIn, setIsSignedIn] = useState(false);
  useEffect(() => {
    if (user) {
      setIsSignedIn(true);
      router.push('/home');
    }
  }, [user]);

  return (
    <main className="flex flex-col items-center justify-center h-screen xs:h-full">
      <Navbar isSignedIn={isSignedIn} userImg={user?.image} />
      <div className="w-full h-full flex xs:flex-col justify-between items-center px-20 xs:mt-2 xs:px-3 py-10">
        <div className="flex flex-col space-y-4 w-1/2 xs:w-full">
          <h1 className="text-6xl xs:text-4xl leading-[80px] text-neutral-900 font-semibold">
            Empowering Student Creators
          </h1>
          <p className="text-2xl xs:text-xl font-light text-neutral-700">
            Where Ideas Thrive and Innovations Shine
          </p>
          <div className="flex gap-5">
          <Link href='/auth/register' className="xs:w-full">
            <Button className="py-8 xs:py-5 text-xl xs:text-lg font-normal mt-3 xs:w-full">Get Started</Button>
          </Link>
          <Button variant='secondary' className="py-8 xs:py-5 text-xl xs:text-lg font-normal mt-3 xs:w-full">It's Free</Button>
          </div>
        </div>
        <div className="h-full flex justify-center items-center w-1/2 xs:w-full">
          <Image src={arm} alt="" />
        </div>
      </div>
      
    </main>
  );
}
