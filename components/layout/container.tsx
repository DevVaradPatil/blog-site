import { cn } from "@/lib/utils";

type ContainerProps = {
    children: React.ReactNode;
    /**
     * `reading` is the article measure; `feed` suits a single column of cards;
     * `wide` is for grids and landing sections.
     */
    width?: "reading" | "feed" | "wide";
    className?: string;
};

const WIDTHS = {
    reading: "max-w-prose",
    feed: "max-w-2xl",
    wide: "max-w-6xl",
} as const;

/**
 * Replaces the hardcoded `w-[550px]` / `w-3/4` widths scattered through the
 * pages, which had no shared definition and broke below 700px.
 */
const Container = ({ children, width = "wide", className }: ContainerProps) => (
    <div className={cn("mx-auto w-full px-5 sm:px-8", WIDTHS[width], className)}>
        {children}
    </div>
);

export default Container;
