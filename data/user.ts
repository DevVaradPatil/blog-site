"use server"
import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                email,
            }
        });
        return user;
    } catch {
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                id,
            }
        });
        return user;
    } catch {
        return null;
    }
}

export const getPostsByUserId = async (id: string) => {
    try {
        const posts = await db.post.findMany({
            where: {
                authorId: id,
            }
        });
        return posts;
    } catch {
        return null;
    }
}

export const getUserByName = async (name: string) => {
    try {
        const users = await db.user.findMany();
        const newUsers = users.filter((user) => user.name?.toLowerCase().includes(name));
        return newUsers;
    } catch {
        return null;
    }
}