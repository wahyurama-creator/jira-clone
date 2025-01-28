import { COLLECTION_MEMBERS_ID, DATABASE_ID } from "@/config";
import { createSessionClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export const getWorkspaces = async () => {

    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const members = await databases.listDocuments(
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

    return await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_MEMBERS_ID,
        [Query.contains("workspaceId", workspacesId)]
    );

} 