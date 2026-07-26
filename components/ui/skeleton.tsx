import { cn } from "@/lib/utils";

function Skeleton({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    );
}

/** Placeholder matching the shape of a post card, for feed loading states. */
function PostCardSkeleton() {
    return (
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-2.5 w-20" />
                </div>
            </div>
            <Skeleton className="h-6 w-4/5" />
            <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-11/12" />
            </div>
            <Skeleton className="h-48 w-full rounded-md" />
        </div>
    );
}

export { Skeleton, PostCardSkeleton };
