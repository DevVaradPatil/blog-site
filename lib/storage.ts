import "server-only";

import { v2 as cloudinary } from "cloudinary";

/**
 * The single seam between this app and whatever hosts our images.
 *
 * Everything else in the codebase talks to these functions and never imports a
 * provider SDK directly. Swapping Cloudinary for R2/Neon Object Storage/S3 is a
 * rewrite of this file alone.
 *
 * That is the lesson from the Firebase outage: provider details had leaked into
 * components, actions and stored URLs, so a billing change meant edits in six
 * places and dead data in the database.
 */

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
] as const;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export type UploadFolder = "posts" | "avatars";

export type StoredImage = {
    url: string;
    publicId: string;
    width: number;
    height: number;
};

/**
 * Upload raw bytes. Returns both the delivery URL and the provider-neutral
 * public id — persist the id where possible so URLs stay regenerable.
 */
export const uploadImage = async (
    bytes: Buffer,
    folder: UploadFolder,
): Promise<StoredImage> => {
    const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
            .upload_stream(
                {
                    folder: `thinktank/${folder}`,
                    resource_type: "image",
                    // Strip metadata and cap dimensions so a 12MP phone photo
                    // doesn't burn credits for a 900px-wide card.
                    transformation: [
                        { width: 2000, height: 2000, crop: "limit" },
                        { quality: "auto", fetch_format: "auto" },
                    ],
                },
                (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
            )
            .end(bytes);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
    };
};

export const deleteImage = async (publicId: string) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch {
        // A failed cleanup should never block the user-facing operation.
    }
};

/**
 * Recover the public id from a stored delivery URL.
 *
 * Needed while the schema still persists full URLs; Phase 2 adds a dedicated
 * publicId column and this becomes a migration helper only.
 */
export const publicIdFromUrl = (url: string): string | null => {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
    return match ? match[1] : null;
};

export const isManagedUrl = (url: string) => url.includes("res.cloudinary.com");
