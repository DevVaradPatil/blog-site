import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: "Think Tank",
  description: "Welcome to ThinkTankProjects.com, the ultimate platform for college and university students to unleash their creativity and intellect! Dive into a world of innovation and inspiration where students showcase their projects in a dynamic and interactive blog-style format. Whether it's groundbreaking research, captivating artwork, or ingenious inventions, our platform is the canvas for students to share their ideas and insights with peers and mentors alike. Join us at ThinkTankProjects.com and immerse yourself in a community dedicated to pushing the boundaries of knowledge and imagination.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={poppins.className}>
          <Toaster />
          {children}
        </body>
      </html>
    </SessionProvider>
  );
}
