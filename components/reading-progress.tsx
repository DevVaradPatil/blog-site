"use client";

import { useEffect, useRef } from "react";

/**
 * A hairline showing how far through the article the reader is.
 *
 * Two deliberate choices, both about smoothness:
 *
 * 1. `transform: scaleX` rather than `width`. Width changes trigger layout on
 *    every scroll frame; a transform is composited on the GPU.
 * 2. No CSS transition. The value updates every animation frame, so a
 *    transition would restart its interpolation each frame and fight the next
 *    update — which reads as stutter. Following the scroll directly is smooth
 *    because the scroll itself is the easing.
 *
 * The bar is written via a ref instead of state so scrolling never triggers a
 * React re-render.
 */
const ReadingProgress = () => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let frame = 0;

        const update = () => {
            frame = 0;
            const scrollable =
                document.documentElement.scrollHeight - window.innerHeight;
            const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;

            if (barRef.current) {
                barRef.current.style.transform = `scaleX(${Math.min(
                    Math.max(ratio, 0),
                    1,
                )})`;
            }
        };

        // rAF-throttled: scroll fires far more often than we can paint.
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
        <div aria-hidden className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
            <div
                ref={barRef}
                className="h-full w-full origin-left bg-signal"
                style={{ transform: "scaleX(0)" }}
            />
        </div>
    );
};

export default ReadingProgress;
