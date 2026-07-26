import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

/**
 * Type system.
 *
 * Space Grotesk gives headings a modern grotesque character with distinctive
 * letterforms; Geist Sans and Mono keep body and data crisp. Replaces the
 * earlier slab-serif pairing, which read as a printed manual.
 */
const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  // Without metadataBase, Next resolves OpenGraph image URLs against localhost
  // and logs a warning — social cards then break in production.
  metadataBase: new URL(siteUrl),
  title: {
    default: "Think Tank — Student project write-ups",
    template: "%s · Think Tank",
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    url: siteUrl,
    title: "Think Tank — Student project write-ups",
    description: siteDescription,
  },
  twitter: { card: "summary_large_image" },
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: siteName }] },
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </SessionProvider>
  );
}
