"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

type MobileNavProps = {
    items: NavItem[];
    signedIn: boolean;
};

/**
 * Navigation for narrow screens.
 *
 * The header's inline links are hidden below `sm`, which previously left mobile
 * users with no route to Read, Search, Following or Saved at all. Radix handles
 * the focus trap, Escape and arrow-key movement.
 */
const MobileNav = ({ items, signedIn }: MobileNavProps) => {
    const pathname = usePathname();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                aria-label="Open menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            >
                <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="label">Browse</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link
                            href={item.href}
                            aria-current={pathname === item.href ? "page" : undefined}
                            className={cn(
                                "w-full cursor-pointer",
                                pathname === item.href && "text-signal",
                            )}
                        >
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {signedIn ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/create-post" className="w-full cursor-pointer">
                                Write a post
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/profile" className="w-full cursor-pointer">
                                Your profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="w-full cursor-pointer">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem asChild>
                        <Link href="/auth/login" className="w-full cursor-pointer">
                            Sign in
                        </Link>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default MobileNav;
