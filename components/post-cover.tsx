import Image from "next/image";

import {
    coverGradient,
    initialsFor,
    isRenderableImageSrc,
    paletteFor,
} from "@/lib/cover";
import { cn } from "@/lib/utils";

type PostCoverProps = {
    /** Stable seed — use the post id so the fallback never shifts. */
    seed: string;
    title: string;
    src?: string | null;
    className?: string;
    /** Matches next/image `sizes`; set it to the widest rendered width. */
    sizes?: string;
    priority?: boolean;
};

/**
 * Renders a post's cover, falling back to a deterministic gradient when there
 * is no image. Every cover surface in the app should go through this rather
 * than a bare <img>, so a missing or dead URL can never render as a broken box.
 */
const PostCover = ({
    seed,
    title,
    src,
    className,
    sizes = "(max-width: 768px) 100vw, 700px",
    priority = false,
}: PostCoverProps) => {
    // Unknown host (e.g. a legacy Firebase URL) would make next/image throw,
    // so anything unrenderable falls through to the gradient.
    if (isRenderableImageSrc(src)) {
        return (
            <div className={cn("relative overflow-hidden bg-neutral-100", className)}>
                <Image
                    src={src}
                    alt={title}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover"
                />
            </div>
        );
    }

    const { ink } = paletteFor(seed);

    return (
        <div
            className={cn(
                "relative overflow-hidden flex items-center justify-center",
                className,
            )}
            style={{ background: coverGradient(seed) }}
            role="img"
            aria-label={title}
        >
            {/* Subtle texture so large fills don't read as flat colour. */}
            <div
                className="absolute inset-0 opacity-[0.15]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                    color: ink,
                }}
            />
            <span
                className="relative font-semibold tracking-tight select-none text-4xl md:text-5xl opacity-90"
                style={{ color: ink }}
            >
                {initialsFor(title)}
            </span>
        </div>
    );
};

export default PostCover;
