import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
    /** What isn't here. Stated plainly, not apologetically. */
    title: string;
    /** What the reader can do about it. */
    description?: string;
    action?: { label: string; href: string };
    icon?: React.ReactNode;
    className?: string;
};

/**
 * An empty screen is an invitation to act, so every one of these takes a
 * next step rather than trailing off into "nothing to show".
 */
const EmptyState = ({
    title,
    description,
    action,
    icon,
    className,
}: EmptyStateProps) => (
    <div
        className={cn(
            "flex flex-col items-center justify-center gap-3 rounded-lg",
            "border border-dashed border-rule bg-card/40 px-6 py-14 text-center",
            className,
        )}
    >
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        {description && (
            <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {action && (
            <Button asChild variant="outline" size="sm" className="mt-2">
                <Link href={action.href}>{action.label}</Link>
            </Button>
        )}
    </div>
);

export default EmptyState;
