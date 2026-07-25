import type { StoredImage, UploadFolder } from "@/lib/storage";

export type UploadOutcome =
    | { ok: true; image: StoredImage }
    | { ok: false; error: string };

/**
 * Browser-side helper that posts a file to `/api/upload`.
 *
 * Components use this instead of holding provider credentials themselves — the
 * old code shipped a Firebase config to the client and wrote straight to the
 * bucket.
 */
export const uploadFile = async (
    file: File,
    folder: UploadFolder = "posts",
): Promise<UploadOutcome> => {
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);

    try {
        const response = await fetch("/api/upload", { method: "POST", body });
        const payload = await response.json();

        if (!response.ok) {
            return { ok: false, error: payload?.error ?? "Upload failed" };
        }

        return { ok: true, image: payload as StoredImage };
    } catch {
        return { ok: false, error: "Network error while uploading" };
    }
};
