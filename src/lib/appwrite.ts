"server-only";

import { AUTH_COOKIE_KEY } from "@/features/auth/constans";
import { cookies } from "next/headers";
import { Client, Account, Databases } from "node-appwrite";

export async function createAdminClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
        .setKey(process.env.NEXT_APPWRITE_KEY!);

    return {
        get account() {
            return new Account(client);
        }
    }
}

export async function createSessionClient() {
    const client = new Client()
        .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
        .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

    const cookie = await cookies();
    const session = await cookie.get(AUTH_COOKIE_KEY);

    if (!session || !session.value) {
        throw new Error("Unauthorized");
    }

    client.setSession(session.value);

    return {
        get account() {
            return new Account(client);
        },

        get databases() {
            return new Databases(client);
        }
    }
}