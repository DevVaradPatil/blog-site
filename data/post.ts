"use server";
import { db } from "@/lib/db";

export const getAllPosts = async () => {
    try {
        const posts = await db.post.findMany();

        return posts;
    } catch {
        return null;
    }
}

export const getPostsByUserId = async (userId: string) => {
    try {
        const posts = await db.post.findMany({
            where: {
                authorId: userId,
            }
        })
        return posts;
    } catch(e) {
        console.log(e);
        
        return null;
    }
}

export const getPostById = async (id: string) => {
    try {
        const post = await db.post.findUnique({
            where: {
               id: id,
            }
        });

        return post;
    } catch(e) {
        console.log(e);
        return null;
    }
}

export const getPostsByTitle = async (title: string) => {
    try {
        const posts = await db.post.findMany();
        const newPosts = posts.filter((post) => post.title.toLowerCase().includes(title) || post.content.toLowerCase().includes(title) || post.tags.map((tag) => tag.toLowerCase()).includes(title));
        return newPosts;
    } catch(e) {
        console.log(e);
        return null;
    }
}

export const updatePostUpvotesById = async (id: string, random: number) => {
    try {
        const post = await db.post.findUnique({
            where: {
                id: id,
            }
        });

        
        if(!post){
            return null;
        }
        
        const updatedPost = await db.post.update({
            where: {
                id: id,
            },
            data: {
                upvotes: post.upvotes + random,
            }
        });

        return updatedPost;
    } catch(e) {
        console.log(e);
        return null;
    }
}

export const deletePostById = async (id: string) => {
    try {
        const post = await db.post.findUnique({
            where: {
                id: id,
            }
        });

        if(!post){
            return null;
        }

        await db.post.delete({
            where: {
                id: id,
            }
        });

        return post;
    } catch(e) {
        console.log(e);
        return null;
    }
}