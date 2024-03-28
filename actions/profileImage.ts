"use server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const profileImage = async (imgUrl : string | undefined) => {
    const user = await currentUser();
    await db.user.update({
            where: {
                id: user?.id
            },
            data: {
                image: imgUrl,
            }
        })
        .then(() => {
            return true;
        }).catch((e) => {
            console.error(e);
            return false;
        })
    return false;
}