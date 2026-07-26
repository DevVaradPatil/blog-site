"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import type { ComponentProps } from "react";

/**
 * `next-themes` was already a dependency but had never been mounted, so the
 * `.dark` variants in the stylesheet were unreachable.
 *
 * `MotionConfig reducedMotion="user"` sits inside it so the whole tree honours
 * a reduced-motion preference at the Framer level: opacity still fades, but
 * transforms are dropped. This is what lets the motion primitives always render
 * a `motion.*` element (SSR-safe) instead of branching on a client-only hook.
 */
export function ThemeProvider({
    children,
    ...props
}: ComponentProps<typeof NextThemesProvider>) {
    return (
        <NextThemesProvider {...props}>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </NextThemesProvider>
    );
}
