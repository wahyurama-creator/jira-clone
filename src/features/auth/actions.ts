import {Account, Client} from "node-appwrite";
import {cookies} from "next/headers";
import {AUTH_COOKIE_KEY} from "@/features/auth/constans";

export const getCurrent = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const cookie = await cookies();
        const session = cookie.get(AUTH_COOKIE_KEY);

        if (!session) return null;

        client.setSession(session.value);
        const account = new Account(client);

        return await account.get();
    } catch (e) {
        console.error("Error getting current user", e);
        return null;
    }
}