import Link from "next/link";

import Container from "./container";
import Brand from "./brand";

const SiteFooter = () => (
    <footer className="mt-20 border-t border-border bg-card/40">
        <Container
            width="wide"
            className="flex flex-col gap-4 py-10 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <Brand />
                <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                    Project write-ups by students — the decisions, the dead ends, and
                    the parts that finally worked.
                </p>
            </div>

            <nav className="flex items-center gap-5 font-mono text-2xs uppercase text-muted-foreground">
                <Link href="/home" className="hover:text-foreground">Read</Link>
                <Link href="/search" className="hover:text-foreground">Search</Link>
                <Link href="/create-post" className="hover:text-foreground">Write</Link>
            </nav>
        </Container>
    </footer>
);

export default SiteFooter;
