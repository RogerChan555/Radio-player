import "server-only";

import { cookies } from "next/headers";
import { decrypt, deleteSession } from "@/lib/session";
import { query } from "./db";

export const verifySession = async () => {
    const cookie = cookies().get("session")?.value;
    const session = await decrypt(cookie);
    if (!session?.userId) {
        return { isAuth: false };
    }
    return { isAuth: true, userId: session.userId };
};

export const getUser = async () => {
    const session = await verifySession();
    if (!session.isAuth) return null;
    try {
        const user = await query(`SELECT * FROM users WHERE id = ?`, [
            session.userId,
        ]);
        return user;
    } catch (error) {
        console.log("Failed to fetch user");
        return null;
    }
};

export const logout = async () => {
    await deleteSession();
};
