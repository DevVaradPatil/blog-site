import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { coverGradient, initialsFor, isRenderableImageSrc } from "@/lib/cover";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
    name?: string | null;
    src?: string | null;
    className?: string;
};

/**
 * Avatar with a deterministic initials-on-gradient fallback.
 *
 * The stock fallback rendered the same generic person icon for everyone, so a
 * list of authors was visually undifferentiated. Seeding the gradient off the
 * name means each author reads as a distinct mark with no image to store.
 */
const UserAvatar = ({ name, src, className }: UserAvatarProps) => {
    const label = name?.trim() || "Anonymous";

    return (
        <Avatar className={cn("border border-rule", className)}>
            {isRenderableImageSrc(src) && (
                <AvatarImage src={src} alt={label} className="object-cover" />
            )}
            <AvatarFallback
                className="font-mono text-[0.7em] font-medium tracking-wide text-white"
                style={{ background: coverGradient(label) }}
            >
                {initialsFor(label) || "?"}
            </AvatarFallback>
        </Avatar>
    );
};

export default UserAvatar;
