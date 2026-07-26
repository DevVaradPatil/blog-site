import Link from "next/link";

import { currentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import UserAvatar from "@/components/user-avatar";
import Container from "./container";

const NAV = [
    { href: "/home", label: "Read" },
    { href: "/search", label: "Search" },
];

// Only meaningful once signed in.
const AUTH_NAV = [
    { href: "/following", label: "Following" },
    { href: "/bookmarks", label: "Saved" },
];

/**
 * One header for the whole site.
 *
 * Replaces two separate navbars — a marketing one and a floating "HomeBar" —
 * that shared no markup and disagreed on the product's name.
 */
const SiteHeader = async () => {
    const user = await currentUser();

    return (
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
            <Container width="wide" className="flex h-16 items-center justify-between gap-6">
                <Link href="/" className="group flex items-baseline gap-2">
                    <span className="font-display text-xl font-bold tracking-tight">
                        Think Tank
                    </span>
                    <span className="hidden font-mono text-2xs uppercase text-muted-foreground sm:inline">
                        student work
                    </span>
                </Link>

                <nav className="flex items-center gap-1">
                    {NAV.map((item) => (
                        <Button key={item.href} asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                            <Link href={item.href}>{item.label}</Link>
                        </Button>
                    ))}
                    {user &&
                        AUTH_NAV.map((item) => (
                            <Button key={item.href} asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                                <Link href={item.href}>{item.label}</Link>
                            </Button>
                        ))}

                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-2 pl-1">
                            <Button asChild size="sm">
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
                        <Button asChild size="sm" className="ml-1">
                            <Link href="/auth/login">Sign in</Link>
                        </Button>
                    )}
                </nav>
            </Container>
        </header>
    );
};

export default SiteHeader;
