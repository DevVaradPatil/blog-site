"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // The server can't know the resolved theme, so render a stable placeholder
    // until hydration rather than flashing the wrong icon.
    useEffect(() => setMounted(true), []);

    const isDark = resolvedTheme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {mounted ? (
                isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
                <div className="h-4 w-4" />
            )}
        </Button>
    );
}
