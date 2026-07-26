import Link from "next/link";

import { cn } from "@/lib/utils";

type BrandProps = {
    className?: string;
    /** Hides the wordmark, leaving just the tile. */
    markOnly?: boolean;
};

/**
 * The logo lock-up.
 *
 * `logo.svg` ships with an opaque near-white background covering its full
 * canvas, so on a dark page it would read as a white square. Seating it in a
 * rounded tile turns that into a deliberate app-icon shape that works in both
 * themes without altering the asset.
 *
 * Plain <img> rather than next/image: the optimizer rejects SVG unless
 * `dangerouslyAllowSVG` is set, and that flag would also let remote SVGs
 * through — a script-injection vector we don't want open for one local file
 * that needs no optimising.
 */
const Brand = ({ className, markOnly = false }: BrandProps) => (
    <Link
        href="/"
        aria-label="Think Tank — home"
        className={cn("group flex shrink-0 items-center gap-2.5", className)}
    >
        <span className="block h-8 w-8 overflow-hidden rounded-lg ring-1 ring-border transition-transform duration-200 ease-out will-change-transform group-hover:-rotate-3 sm:h-9 sm:w-9">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logo.svg"
                alt=""
                width={36}
                height={36}
                className="h-full w-full object-cover"
            />
        </span>

        {!markOnly && (
            <span className="font-display text-lg font-bold tracking-tight sm:text-xl">
                Think Tank
            </span>
        )}
    </Link>
);

export default Brand;
