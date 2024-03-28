"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { CreatePostSchema } from "@/schemas";
import { getUserById } from "@/data/user";

export const createPost = async (values: z.infer<typeof CreatePostSchema>) =>{
    const validatedFileds = CreatePostSchema.safeParse(values);

    if(!validatedFileds.success){
        return {error: "Invalid fields!"};
    }

    const { title, content, image, authorId, tags, link } = validatedFileds.data;

    const existingUser = await getUserById(authorId);

    if(!existingUser) {
        return {error: "User not found!"};
    }
    if(image){
        await db.post.create({
            data: {
                title, 
                content, 
                authorId,
                tags,
                link,
                images: [image!],
            }
        });
    }else{
        await db.post.create({
            data: {
                title, 
                content, 
                authorId,
                tags,
                link
            }
        });
    }



    return { success : "Post Created!"};
}