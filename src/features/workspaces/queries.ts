import { COLLECTION_MEMBERS_ID, COLLECTION_WORKSPACES_ID, DATABASE_ID } from "@/config";
import { getMember } from "@/features/members/utils";
import { Workspace } from "@/features/workspaces/types";
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

interface GetWorkspaceByIdProps {
    workspaceId: string;
}

export const getWorkspaceById = async ({ workspaceId }: GetWorkspaceByIdProps) => {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    const member = await getMember(
        {
            databases: databases,
            workspaceId: workspaceId,
            userId: user.$id,
        }
    );

    if (!member) {
        throw new Error("You are not a member of this workspace");
    }

    return await databases.getDocument<Workspace>(
        DATABASE_ID,
        COLLECTION_WORKSPACES_ID,
        workspaceId,
    );
}

interface GetWorkspaceInfoByIdProps {
    workspaceId: string;
}

export const getWorkspaceInfoById = async ({ workspaceId }: GetWorkspaceInfoByIdProps) => {
    const { databases } = await createSessionClient();

    const workspace = await databases.getDocument<Workspace>(
        DATABASE_ID,
        COLLECTION_WORKSPACES_ID,
        workspaceId,
    );

    return {
        name: workspace.name,
    };
}