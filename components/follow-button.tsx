"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Plus } from "lucide-react";

import { toggleFollow } from "@/actions/follow-actions";
import { cn } from "@/lib/utils";

type FollowButtonProps = {
    targetId: string;
    initialFollowing: boolean;
};

const FollowButton = ({ targetId, initialFollowing }: FollowButtonProps) => {
    const router = useRouter();
    const [following, setFollowing] = useState(initialFollowing);
    const [hovered, setHovered] = useState(false);
    const [pending, startTransition] = useTransition();

    const toggle = () => {
        const previous = following;
        setFollowing(!previous); // optimistic

        startTransition(async () => {
            const result = await toggleFollow(targetId);
            if (result.error) {
                setFollowing(previous);
                toast.error(result.error);
                return;
            }
            setFollowing(Boolean(result.following));
            router.refresh(); // keep follower counts fresh
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={pending}
            aria-pressed={following}
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                following
                    ? "border border-border bg-transparent hover:border-destructive/50 hover:text-destructive"
                    : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
        >
            {following ? (
                <>
                    <Check className="h-3.5 w-3.5" />
                    {/* On hover, offer the exit rather than restating the state. */}
                    {hovered ? "Unfollow" : "Following"}
                </>
            ) : (
                <>
                    <Plus className="h-3.5 w-3.5" />
                    Follow
                </>
            )}
        </button>
    );
};

export default FollowButton;
