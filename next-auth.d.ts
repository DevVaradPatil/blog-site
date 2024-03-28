import { Post, UserRole } from "@prisma/client";
import NextAuth, {type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession['user'] & {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOAuth: boolean;
    posts: Post[];
    bio: string;
    linkedin: string;
    github: string;
    image: string;
};


declare module 'next-auth' {
    interface Session {
      user: ExtendedUser;
    }
  }