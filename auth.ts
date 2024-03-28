import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPostsByUserId, getUserById } from "./data/user";
import { db } from "./lib/db";
import authConfig from "./auth.config";
import { Post, UserRole } from "@prisma/client";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
   async linkAccount({ user }){
    await db.user.update({
      where: { id: user.id },
      data: {emailVerified: new Date()}
    })
   }
  },
  callbacks: {

    

    async signIn ({ user, account }){
      //Allow OAuth without email verification
      if(account?.provider !== "credentials") return true;

      // Prevent sign in without verification
      const exisitingUser = await getUserById(user.id!);

      if(!exisitingUser?.emailVerified) return false;

      if(exisitingUser?.isTwoFactorEnabled){
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(exisitingUser.id!);

        if(!twoFactorConfirmation) return false;

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id }
        })
      }

      return true;
    },



    async session({session, token}){
      
      if(token.sub  && session.user){
        session.user.id = token.sub;
      }

      if(token.role && session.user){
        session.user.role = token.role as UserRole;
      }
      
      if(session.user){
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;
      }

      if(session.user){
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.posts = token.posts as Post[];
        session.user.bio = token.bio as string;
        session.user.linkedin = token.linkedin as string;
        session.user.github = token.github as string;
        session.user.image = token.image as string;
      }

      return session;
    },
    async jwt({token}) {

      if(!token.sub) return token;
      
      const exisitingUser = await getUserById(token.sub!);
      if(!exisitingUser) return token;
      
      const existingAccount = await getAccountByUserId(exisitingUser.id!);
      const userPosts = await getPostsByUserId(exisitingUser.id!);

      
      token.isOAuth = !!existingAccount;
      token.name = exisitingUser.name;
      token.email = exisitingUser.email;
      token.role = exisitingUser.role;
      token.isTwoFactorEnabled = exisitingUser.isTwoFactorEnabled;
      token.posts = userPosts;
      token.bio = exisitingUser.bio;
      token.linkedin = exisitingUser.linkedin;
      token.github = exisitingUser.github;
      token.image = exisitingUser.image;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
