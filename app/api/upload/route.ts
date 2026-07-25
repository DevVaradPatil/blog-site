import { NextResponse } from "next/server";

import { currentUser } from "@/lib/auth";
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_UPLOAD_BYTES,
    uploadImage,
    type UploadFolder,
} from "@/lib/storage";

/**
 * Server-side image upload.
 *
 * Replaces the old flow, where the browser held provider credentials and wrote
 * straight to the bucket with no auth, no type check and no size cap. Now the
 * bytes pass through here so we can require a session and validate them.
 */
export async function POST(request: Request) {
    const user = await currentUser();

    if (!user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let form: FormData;
    try {
        form = await request.formData();
    } catch {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const file = form.get("file");
    const folderValue = form.get("folder");
    const folder: UploadFolder = folderValue === "avatars" ? "avatars" : "posts";

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
        return NextResponse.json(
            { error: "Only JPEG, PNG, WebP, GIF and AVIF images are allowed" },
            { status: 415 },
        );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
            { error: "Image must be 5MB or smaller" },
            { status: 413 },
        );
    }

    try {
        const bytes = Buffer.from(await file.arrayBuffer());
        const stored = await uploadImage(bytes, folder);

        return NextResponse.json(stored);
    } catch (error) {
        console.error("Upload failed:", error);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
