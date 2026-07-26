import Link from "next/link";

import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import UserAvatar from "@/components/user-avatar";
import Container from "./container";
import Brand from "./brand";
import MobileNav, { type NavItem } from "./mobile-nav";

const NAV: NavItem[] = [
    { href: "/home", label: "Read" },
    { href: "/search", label: "Search" },
];

// Only meaningful once signed in.
const AUTH_NAV: NavItem[] = [
    { href: "/following", label: "Following" },
    { href: "/bookmarks", label: "Saved" },
];

/**
 * One header for the whole site.
 *
 * Replaces two separate navbars — a marketing one and a floating "HomeBar" —
 * that shared no markup and disagreed on the product's name.
 *
 * Inline links appear from `sm` up; below that everything moves into
 * `MobileNav` so no destination becomes unreachable.
 */
const SiteHeader = async () => {
    const user = await currentUser();
    const links = user ? [...NAV, ...AUTH_NAV] : NAV;

    // `backdrop-blur-sm` (4px) rather than the default 8px: a backdrop filter
    // on a sticky element re-filters on every scroll frame, and halving the
    // radius roughly halves that cost. `transform-gpu` keeps the header on its
    // own compositor layer so it isn't repainted with the page beneath it.
    return (
        <header className="sticky top-0 z-40 transform-gpu border-b border-border bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/75">
            <Container
                width="wide"
                className="flex h-16 items-center justify-between gap-3"
            >
                <Brand />

                <nav className="flex items-center gap-1">
                    {links.map((item) => (
                        <Button
                            key={item.href}
                            asChild
                            variant="ghost"
                            size="sm"
                            className="hidden sm:inline-flex"
                        >
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                    ))}

                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-2 sm:pl-1">
                            {/* The menu already carries "Write a post" on mobile. */}
                            <Button asChild size="sm" className="hidden sm:inline-flex">
                                <Link href="/create-post">Write</Link>
                            </Button>
                            <Link href="/profile" aria-label="Your profile">
                                <UserAvatar
                                    name={user.name}
                                    src={user.image}
                                    className="h-9 w-9"
                                />
                            </Link>
                        </div>
                    ) : (
                        <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
                            <Link href="/auth/login">Sign in</Link>
                        </Button>
                    )}

                    <MobileNav items={links} signedIn={Boolean(user)} />
                </nav>
            </Container>
        </header>
    );
};

export default SiteHeader;
