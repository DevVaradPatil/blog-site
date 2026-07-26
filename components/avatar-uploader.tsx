"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera } from "lucide-react";

import UserAvatar from "./user-avatar";
import LoadingSpinner from "./loading-spinner";
import { profileImage } from "@/actions/profileImage";
import { uploadFile } from "@/lib/upload-client";

type AvatarUploaderProps = {
    name?: string | null;
    src?: string | null;
};

/**
 * The avatar with an upload affordance. Split out of the old profile component
 * so the surrounding page can stay a server component.
 */
const AvatarUploader = ({ name, src }: AvatarUploaderProps) => {
    const router = useRouter();
    const [preview, setPreview] = useState<string | null>(src ?? null);
    const [busy, setBusy] = useState(false);

    const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previous = preview;
        setBusy(true);

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);

        const upload = await uploadFile(file, "avatars");

        if (!upload.ok) {
            setPreview(previous);
            setBusy(false);
            URL.revokeObjectURL(localUrl);
            toast.error(upload.error);
            return;
        }

        const result = await profileImage(upload.image.url);
        URL.revokeObjectURL(localUrl);

        if (result.error) {
            setPreview(previous);
            toast.error(result.error);
        } else {
            setPreview(upload.image.url);
            toast.success(result.success);
            router.refresh();
        }

        setBusy(false);
    };

    return (
        <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
            <UserAvatar name={name} src={preview} className="h-full w-full" />

            {busy && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                    <LoadingSpinner />
                </div>
            )}

            <label
                htmlFor="avatar-upload"
                className="absolute inset-x-0 bottom-0 flex cursor-pointer items-center justify-center gap-1 rounded-b-full bg-foreground/70 py-1.5 font-mono text-2xs uppercase text-background opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100"
            >
                <Camera className="h-3 w-3" />
                Change
            </label>
            <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={busy}
                onChange={handleChange}
            />
        </div>
    );
};

export default AvatarUploader;
