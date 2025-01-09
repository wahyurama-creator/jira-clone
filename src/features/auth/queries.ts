import { createSessionClient } from "@/lib/appwrite";

export const getCurrent = async () => {
    try {
        const { account } = await createSessionClient();

        return await account.get();
    } catch (e) {
        console.error("Error getting current user", e);
        return null;
    }
}