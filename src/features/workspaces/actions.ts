import {Account, Client, Databases, Query} from "node-appwrite";
import {cookies} from "next/headers";
import {AUTH_COOKIE_KEY} from "@/features/auth/constans";
import {COLLECTION_MEMBERS_ID, DATABASE_ID} from "@/config";

export const getWorkspaces = async () => {
    try {
        const client = new Client()
            .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
            .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

        const cookie = await cookies();
        const session = cookie.get(AUTH_COOKIE_KEY);

        if (!session) return {
            documents: [],
            total: 0,
        };

        client.setSession(session.value);
        const account = new Account(client);
        const database = new Databases(client);
        const user = await account.get();

        const members = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_MEMBERS_ID,
            [Query.equal("userId", user.$id)]
        );

        if (members.total === 0) {
            return {
                documents: [],
                total: 0,
            }
        }

        const workspacesId = members.documents.map((member) => member.workspaceId);

        return await database.listDocuments(
            DATABASE_ID,
            COLLECTION_MEMBERS_ID,
            [Query.contains("workspaceId", workspacesId)]
        );
    } catch {
        return {
            documents: [],
            total: 0,
        }
    }
}