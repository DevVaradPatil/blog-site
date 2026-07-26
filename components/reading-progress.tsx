"use client";

import { useEffect, useState } from "react";

/**
 * A hairline showing how far through the article the reader is.
 *
 * Purely decorative for navigation purposes, so it's hidden from assistive
 * tech rather than announcing a constantly-changing value.
 */
const ReadingProgress = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const scrollable =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
        };

        // rAF-throttled: scroll fires far more often than we need to paint.
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div
            aria-hidden
            className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
        >
            <div
                className="h-full bg-signal transition-[width] duration-150 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default ReadingProgress;
